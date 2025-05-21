import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import ListingCard from "../components/ListingCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from 'prop-types';
import { 
  faGlobe, 
  faUmbrellaBeach, 
  faCity, 
  faMountain, 
  faTree, 
  faWater, 
  faHouseChimney,
  faFire,
  faCampground,
  faSnowflake,
  faSun,
  faAnchor,
  faPlane,
  faHotel,
  faMapMarkedAlt,
  faCompass
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

// Configure token-based authentication
const token = localStorage.getItem('authToken');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const categories = [
  { id: "all", name: "All", icon: faGlobe },
  { id: "beach-houses", name: "Beach Houses", icon: faUmbrellaBeach },
  { id: "city-apartments", name: "City Apartments", icon: faCity },
  { id: "mountain-cabins", name: "Mountain Cabins", icon: faMountain },
  { id: "forest-lodges", name: "Forest Lodges", icon: faTree },
  { id: "pools", name: "Pools", icon: faWater },
  { id: "luxury-villas", name: "Luxury Villas", icon: faHouseChimney },
  { id: "trending", name: "Trending", icon: faFire },
  { id: "camping", name: "Camping", icon: faCampground },
  { id: "arctic", name: "Arctic", icon: faSnowflake },
  { id: "desert", name: "Desert", icon: faSun },
  { id: "islands", name: "Islands", icon: faAnchor }
];

const Home = ({ searchTerm }) => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const role = localStorage.getItem('role');
  const navigate = useNavigate();
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [clickedListingId, setClickedListingId] = useState(null);
  const [loadingIcons] = useState([faHotel, faPlane, faMapMarkedAlt, faCompass, faGlobe, faUmbrellaBeach]);
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const [wishlistNotification, setWishlistNotification] = useState(null);

  // Animation for loading icons
  useEffect(() => {
    if (loading || categoryLoading) {
      const iconInterval = setInterval(() => {
        setCurrentIconIndex(prevIndex => (prevIndex + 1) % loadingIcons.length);
      }, 1000);
      
      return () => clearInterval(iconInterval);
    }
  }, [loading, categoryLoading, loadingIcons]);

  // Progress bar animation
  useEffect(() => {
    if (loading) {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90; // Cap at 90% until actual data loads
          }
          return prev + 1;
        });
      }, 30);
      
      return () => clearInterval(progressInterval);
    }
  }, [loading]);

  // Fetch listings from API
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setLoadingProgress(0);
      
      try {
        const response = await axios.get('http://localhost:8000/api/listings');
        console.log('API Response:', response.data);
        
        if (response.data.success && Array.isArray(response.data.data)) {
          const formattedListings = response.data.data.map(listing => {
            const rating = listing.average_rating ? parseFloat(listing.average_rating) : 0;
            const totalRatings = parseInt(listing.total_ratings || 0);
            
            return {
              id: listing.id,
              title: listing.title,
              location: listing.location,
              price: parseFloat(listing.price),
              main_photo: listing.main_photo,
              description: listing.description,
              category: listing.category,
              status: listing.status,
              wishlist_id: listing.wishlist_id,
              host: listing.host,
              rating: rating,
              total_ratings: totalRatings
            };
          });

          console.log('Formatted listings with ratings:', formattedListings);

          setLoadingProgress(100);
          
          setTimeout(() => {
            setListings(formattedListings);
            setFilteredListings(formattedListings);
            setLoading(false);
          }, 500);
        } else {
          console.error("Invalid response format:", response.data);
          setListings([]);
          setFilteredListings([]);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
        setListings([]);
        setFilteredListings([]);
      setLoading(false);
      }
    };

    fetchListings();

    // Listen for rating updates
    const handleReviewUpdate = (event) => {
      const { listingId, averageRating, totalReviews } = event.detail;
      console.log('Updating rating for listing:', { listingId, averageRating, totalReviews });
      
      const updateListingRatings = (prevListings) => 
        prevListings.map(listing => {
          if (listing.id === parseInt(listingId)) {
            const newRating = parseFloat(averageRating);
            return { 
              ...listing, 
              rating: newRating,
              total_ratings: parseInt(totalReviews)
            };
          }
          return listing;
        });

      setListings(updateListingRatings);
      setFilteredListings(updateListingRatings);
    };

    window.addEventListener('reviewUpdated', handleReviewUpdate);

    return () => {
      window.removeEventListener('reviewUpdated', handleReviewUpdate);
    };
  }, []);

  useEffect(() => {
    if (role === 'admin') {
      // No need to store users since we're not using them
      // Just keeping this effect to check role
    }
  }, [role]);

  // Update the filter logic
  useEffect(() => {
    let filtered = [...listings];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(listing => listing.category === selectedCategory);
    }
    
    setFilteredListings(filtered);
  }, [searchTerm, listings, selectedCategory]);

  const handleFilterClick = (category) => {
    setCategoryLoading(true);
    setSelectedCategory(category);
    setTimeout(() => {
      setCategoryLoading(false);
    }, 800); // Increased for better visibility
  };

  const handleDeleteClick = (listingId) => {
    if (!isLoggedIn || role !== 'admin') {
      navigate('/login');
      return;
    }
    setDeleteConfirmation(listingId);
  };

  const handleConfirmDelete = async (listingId) => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const role = localStorage.getItem('role');
      
      if (!token || role !== 'admin') {
        setShowSuccessMsg(false);
        setNotification({
          type: 'error',
          message: 'You must be an admin to delete listings'
        });
        return;
      }

      const response = await axios.delete(`http://localhost:8000/api/listings/${listingId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.status === 200 || response.status === 204) {
        // Remove the deleted listing from both listings and filteredListings
      const updatedListings = listings.filter(listing => listing.id !== listingId);
        const updatedFilteredListings = filteredListings.filter(listing => listing.id !== listingId);
        
      setListings(updatedListings);
        setFilteredListings(updatedFilteredListings);
        
      setShowSuccessMsg(true);
      setTimeout(() => setShowSuccessMsg(false), 3000);
      } else {
        throw new Error('Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete listing. Please try again.'
      });
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmation(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation(null);
  };

  // Add a handler for wishlist notifications
  const handleWishlistNotification = (message, type) => {
    setWishlistNotification({ message, type });
    // Auto-close after 3 seconds
    setTimeout(() => {
      setWishlistNotification(null);
    }, 3000);
  };

  return (
    <div className="page-wrapper">
      <div className="home-container">
          {showSuccessMsg && (
            <div className="success-message" data-aos="fade-down">
              Listing deleted successfully!
            </div>
          )}
        
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
            <button className="close-btn" onClick={() => setNotification(null)}>×</button>
          </div>
        )}

        {wishlistNotification && (
          <div className={`notification ${wishlistNotification.type}`}>
            {wishlistNotification.message}
            <button className="close-btn" onClick={() => setWishlistNotification(null)}>×</button>
          </div>
        )}

        <div className="filters-container">
          <div className="filters" data-aos="fade-down">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`filter-button ${selectedCategory === category.id ? "active" : ""}`}
                onClick={() => handleFilterClick(category.id)}
              >
                <FontAwesomeIcon icon={category.icon} />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="content-area">
          {loading ? (
            <div className="loading-container">
              <div className="spinner-wrapper">
                <div className="custom-spinner">
                  <div className="spinner-ring"></div>
                  <div className="spinner-icon">
                    <FontAwesomeIcon icon={loadingIcons[currentIconIndex]} />
                  </div>
                </div>
                <h3 className="loading-title">Discovering amazing stays...</h3>
                <p className="loading-text">We&apos;re finding the perfect getaways for you</p>
                <div className="loading-progress">
                  <div className="progress-bar" style={{ width: `${loadingProgress}%` }}></div>
                </div>
                <div className="loading-destinations">
                  <span className="destination">Paris</span>
                  <span className="destination">Bali</span>
                  <span className="destination">New York</span>
                  <span className="destination">Tokyo</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="listings-container">
              {categoryLoading ? (
                <div className="loading-container category-loading">
                  <div className="spinner-wrapper">
                    <div className="custom-spinner">
                      <div className="spinner-ring"></div>
                      <div className="spinner-icon">
                        <FontAwesomeIcon icon={loadingIcons[currentIconIndex]} />
                      </div>
                    </div>
                    <h3 className="loading-title">Filtering by {categories.find(c => c.id === selectedCategory)?.name}</h3>
                    <p className="loading-text">Finding your perfect match...</p>
                  </div>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="no-results" data-aos="fade-up">
                  <p>No listings found for this category.</p>
              </div>
            ) : (
                <div className="listings-grid">
                  {filteredListings.map((listing, index) => (
                <div 
                  key={listing.id} 
                  data-aos="fade-up"
                  data-aos-once="true"
                  data-aos-delay={index * 50}
                  data-aos-duration="800"
                  className={`listing-wrapper ${clickedListingId === listing.id ? 'loading' : ''}`}
                      onClick={() => {
                        setClickedListingId(listing.id);
                        setTimeout(() => {
                          navigate(`/listing/${listing.id}`);
                        }, 500);
                      }}
                >
                  <ListingCard 
                    listing={listing} 
                    onWishlistUpdate={(message, type) => handleWishlistNotification(message, type)}
                  />
                  {isLoggedIn && role === 'admin' && (
                    <button 
                          className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(listing.id);
                      }}
                      disabled={deleteLoading}
                    >
                          <FontAwesomeIcon icon="trash" className="delete-icon" />
                          <span>Delete</span>
                    </button>
                  )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}
          </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} EasyTrip. All rights reserved.</p>
        </div>
      </footer>

          {deleteConfirmation && (
            <>
          <div className="modal-overlay" onClick={handleCancelDelete}></div>
              <div className="delete-confirmation-modal">
                <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this listing? This action cannot be undone.</p>
                <div className="confirmation-buttons">
                  <button 
                    className="cancel-delete"
                    onClick={handleCancelDelete}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button 
                className={`confirm-delete ${deleteLoading ? 'loading' : ''}`}
                    onClick={() => handleConfirmDelete(deleteConfirmation)}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </>
          )}

      <style>{`
        .page-wrapper {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .home-container {
          flex: 1;
          max-width: 1280px;
          margin: 0 auto;
          padding: 20px 40px;
          width: 100%;
        }

        .content-area {
          min-height: 400px; /* Minimum height to push footer down */
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          width: 100%;
        }

        .category-loading {
          min-height: 200px;
        }

        .spinner-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          background-color: white;
          border-radius: 1rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          width: 90%;
          text-align: center;
          animation: fadeIn 0.5s ease;
        }

        .custom-spinner {
          position: relative;
          width: 100px;
          height: 100px;
          margin-bottom: 1.5rem;
        }

        .spinner-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 4px solid transparent;
          border-top-color: #ff385c;
          border-radius: 50%;
          animation: spin 1.5s linear infinite;
        }

        .spinner-ring:before {
          content: '';
          position: absolute;
          top: 5px;
          left: 5px;
          right: 5px;
          bottom: 5px;
          border: 4px solid transparent;
          border-top-color: #00a699;
          border-radius: 50%;
          animation: spin 3s linear infinite;
        }

        .spinner-ring:after {
          content: '';
          position: absolute;
          top: 15px;
          left: 15px;
          right: 15px;
          bottom: 15px;
          border: 4px solid transparent;
          border-top-color: #484848;
          border-radius: 50%;
          animation: spin 1.5s linear infinite reverse;
        }

        .spinner-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 2rem;
          color: #ff385c;
          animation: pulse 2s ease infinite;
        }

        .loading-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #343a40;
          margin: 0 0 0.5rem;
        }

        .loading-text {
          margin: 0 0 1.5rem;
          color: #6c757d;
          font-size: 1rem;
        }

        .loading-progress {
          width: 80%;
          height: 6px;
          background-color: #e9ecef;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-bar {
          height: 100%;
          width: 0;
          background: linear-gradient(to right, #ff385c, #00a699);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .loading-destinations {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 0.5rem;
        }

        .destination {
          padding: 5px 12px;
          background-color: #f8f9fa;
          border-radius: 20px;
          font-size: 0.85rem;
          color: #6c757d;
          animation: pulse 2s infinite alternate;
          animation-delay: calc(var(--i, 0) * 0.5s);
        }

        .destination:nth-child(1) { --i: 0; }
        .destination:nth-child(2) { --i: 1; }
        .destination:nth-child(3) { --i: 2; }
        .destination:nth-child(4) { --i: 3; }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(0.9);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(0.9);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .footer {
          margin-top: auto;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
          padding: 20px 0;
          width: 100%;
        }

        .footer-content {
          max-width: 1280px;
          margin: 0 auto;
          text-align: center;
          color: #6c757d;
        }

        .filters-container {
          margin-bottom: 30px;
          position: sticky;
          top: 80px;
          background: white;
          z-index: 10;
          padding: 15px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .filters {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          padding: 5px 0;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          margin: 0 -10px;
          padding: 0 10px;
        }

        .filters::-webkit-scrollbar {
          display: none;
        }
        
        .filter-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          color: #222;
          font-size: 0.95rem;
          min-width: fit-content;
        }

        .filter-button:hover {
          border-color: #222;
          transform: translateY(-1px);
        }

        .filter-button.active {
          background: #222;
          color: white;
          border-color: #222;
        }

        .listings-container {
          position: relative;
          min-height: 200px;
        }

        .listings-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          padding: 0;
          animation: fadeIn 0.5s ease;
          margin: 0 auto;
        }

        .listing-wrapper {
          position: relative;
          transition: all 0.3s ease;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          background: white;
          height: 100%;
          display: flex;
          flex-direction: column;
          transform: translateY(0);
        }

        .listing-wrapper:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.12);
        }

        .listing-wrapper.loading {
          opacity: 0.7;
          transform: scale(0.98);
        }

        .no-results {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin: 40px auto;
          max-width: 500px;
          animation: fadeIn 0.5s ease;
        }

        .no-results p {
          color: #717171;
          font-size: 1.2rem;
          margin: 0;
        }

        .delete-button {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: #ff385c;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          z-index: 5;
          opacity: 0;
          transform: translateY(10px);
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .listing-wrapper:hover .delete-button {
          opacity: 1;
          transform: translateY(0);
        }

        .delete-button:hover:not(:disabled) {
          background: #e31c5f;
          transform: scale(1.05);
        }

        .delete-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .delete-icon {
          font-size: 0.9rem;
        }

        .success-message {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #4CAF50;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          z-index: 1000;
          animation: slideDown 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        @keyframes slideDown {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        @media (max-width: 1280px) {
          .home-container {
            padding: 20px;
          }
        }

        @media (max-width: 1024px) {
          .listings-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
        }

        @media (max-width: 768px) {
          .home-container {
            padding: 15px;
          }

          .filters-container {
            margin-bottom: 20px;
            padding: 10px 0;
          }

          .filter-button {
            padding: 10px 16px;
            font-size: 0.9rem;
          }

          .listings-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }

          .delete-button {
            opacity: 1;
            transform: translateY(0);
            bottom: 15px;
            right: 15px;
            padding: 6px 12px;
            font-size: 0.85rem;
          }

          .delete-confirmation-modal {
            padding: 20px;
          }
        }

        @media (max-width: 480px) {
          .listings-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px 20px;
          border-radius: 8px;
          color: white;
          font-size: 0.95rem;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: slideIn 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .notification.error {
          background: #dc3545;
        }

        .notification.success {
          background: #28a745;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0 5px;
          margin-left: 10px;
        }

        .close-btn:hover {
          opacity: 0.8;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .delete-confirmation-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 30px;
          border-radius: 12px;
          z-index: 1001;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          animation: scaleIn 0.3s ease;
        }

        .delete-confirmation-modal h3 {
          margin-top: 0;
          color: #222;
        }

        .confirmation-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin-top: 20px;
        }

        .cancel-delete,
        .confirm-delete {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-delete {
          background: #f1f3f5;
          border: none;
          color: #495057;
        }

        .cancel-delete:hover:not(:disabled) {
          background: #e9ecef;
        }

        .confirm-delete {
          background: #ff385c;
          border: none;
          color: white;
        }

        .confirm-delete:hover:not(:disabled) {
          background: #e31c5f;
        }

        .confirm-delete.loading {
          opacity: 0.8;
          cursor: wait;
        }

        @keyframes scaleIn {
          from {
            transform: translate(-50%, -50%) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

Home.propTypes = {
  searchTerm: PropTypes.string
};

export default Home;