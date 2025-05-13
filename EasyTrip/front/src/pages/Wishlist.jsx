import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faArrowLeft, faHome } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/Sidebar";
import ListingCard from "../components/ListingCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// Add loading animation constants
const LOADING_MESSAGES = [
  "Finding your favorite places...",
  "Preparing your wishlist...",
  "Gathering your dream destinations...",
  "Almost there..."
];

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const navigate = useNavigate();

  const fetchWishlistItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Please log in to view your wishlist');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:8000/api/wishlists', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('API Response:', response.data); // Debug the API response

      // Check various possible response formats
      let wishlistsData = [];
      
      if (response.data.success && Array.isArray(response.data.wishlists)) {
        wishlistsData = response.data.wishlists;
      } else if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
        wishlistsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        wishlistsData = response.data;
      } else if (response.data.wishlists && Array.isArray(response.data.wishlists)) {
        wishlistsData = response.data.wishlists;
      } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
        // If it's just a direct object with listing data
        wishlistsData = [response.data];
      }

      // Process the wishlist data
      if (wishlistsData.length > 0) {
        const formattedListings = wishlistsData.map(item => {
          // Handle different data structures
          const listing = item.listing || item;
          if (!listing || !listing.id) return null;
          
          const rating = listing.average_rating ? parseFloat(listing.average_rating) : 
                       (listing.rating ? parseFloat(listing.rating) : 0);
                       
          const totalRatings = listing.total_ratings ? parseInt(listing.total_ratings) : 
                              (listing.totalRatings ? parseInt(listing.totalRatings) : 0);
          
          return {
            ...listing,
            wishlist_id: item.id || listing.id,
            rating: rating,
            total_ratings: totalRatings,
            averageRating: rating,
            totalRatings: totalRatings
          };
        }).filter(Boolean);
        
        console.log('Formatted wishlist items:', formattedListings);
        
        setWishlistItems(formattedListings);
        setError(null); // Clear any previous errors
      } else {
        console.log('No wishlist items found in response');
        setWishlistItems([]);
        // No error, just an empty wishlist
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      // Use setTimeout to ensure the DOM has updated with the loading state before showing error
      setTimeout(() => {
        setError(error.response?.data?.message || 'Failed to load wishlist. Please try again later.');
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set a flag to check if component is mounted
    let isMounted = true;
    
    const initFetch = async () => {
      try {
        await fetchWishlistItems();
      } catch (error) {
        console.error('Initial wishlist fetch failed:', error);
        if (isMounted) {
          setError('Failed to load wishlist. Please refresh the page.');
        }
      }
    };
    
    initFetch();
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, []);

  // Add loading message rotation
  useEffect(() => {
    if (!loading) return;
    
    let messageIndex = 0;
    const intervalId = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[messageIndex]);
    }, 2000); // Change message every 2 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, [loading]);

  const handleRemoveFromWishlist = async (listingId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Please log in to remove items from your wishlist');
        return;
      }

      // Find the wishlist item with this listing ID
      const wishlistItem = wishlistItems.find(item => item.id === listingId);
      if (!wishlistItem) {
        console.error('Wishlist item not found for listing ID:', listingId);
        return;
      }

      // Use the wishlist_id from the item to delete
      const wishlistId = wishlistItem.wishlist_id;
      if (!wishlistId) {
        console.error('No wishlist ID found for listing:', listingId);
        setError('Unable to remove from wishlist. Please try again.');
        return;
      }

      console.log(`Removing wishlist ID ${wishlistId} for listing ID ${listingId}`);
      
      const response = await axios.delete(`http://localhost:8000/api/wishlists/${wishlistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 || response.status === 204) {
        // Remove the item from the local state
        setWishlistItems(prev => prev.filter(item => item.id !== listingId));
        // Clear any previous errors
        setError(null);
      } else {
        throw new Error('Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setError(error.response?.data?.message || 'Failed to remove item from wishlist. Please try again.');
    }
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="content-area">
        {loading ? (
          <div className="loading-container">
            <div className="loading-content">
              <LoadingSpinner size="large" />
              <h3 className="loading-title">{loadingMessage}</h3>
              <div className="loading-progress">
                <div className="progress-bar"></div>
              </div>
              <div className="loading-destinations">
                <span className="destination"><FontAwesomeIcon icon={faHeart} /> Paris</span>
                <span className="destination"><FontAwesomeIcon icon={faHeart} /> Bali</span>
                <span className="destination"><FontAwesomeIcon icon={faHeart} /> Tokyo</span>
                <span className="destination"><FontAwesomeIcon icon={faHeart} /> Rome</span>
              </div>
            </div>
            <div className="floating-hearts">
              {[...Array(8)].map((_, i) => (
                <FontAwesomeIcon 
                  key={i} 
                  icon={faHeart} 
                  className={`floating-heart heart-${i + 1}`} 
                />
              ))}
            </div>
          </div>
        ) : (
          <main className="wishlist-container">
            <div className="wishlist-header">
              <Link to="/" className="back-button">
                <FontAwesomeIcon icon={faArrowLeft} /> Back to listings
              </Link>
              <h1><FontAwesomeIcon icon={faHeart} /> My Wishlist</h1>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="wishlist-grid">
              {wishlistItems.length > 0 ? (
                wishlistItems.map((listing) => (
                  <div 
                    key={listing.id} 
                    className="wishlist-item"
                    data-aos="fade-up"
                  >
                    <ListingCard 
                      listing={listing} 
                      onRemoveFromWishlist={() => handleRemoveFromWishlist(listing.id)}
                      isInWishlist={true}
                    />
                  </div>
                ))
              ) : (
                <div className="empty-wishlist" data-aos="fade-up">
                  <FontAwesomeIcon icon={faHeart} className="empty-icon" />
                  <h2>Your wishlist is empty</h2>
                  <p>Save your favorite places by clicking the heart icon on any listing</p>
                  <Link to="/" className="browse-button">
                    Browse Listings
                  </Link>
                </div>
              )}
            </div>
          </main>
        )}
      </div>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} EasyTrip. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        .page-wrapper {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .content-area {
          flex: 1;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          width: 100%;
        }

        .loading-content {
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

        .loading-title {
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          font-size: 1.5rem;
          font-weight: 600;
          color: #343a40;
        }

        .loading-message {
          margin: 0 0 1.5rem;
          color: #6c757d;
        }

        .loading-progress {
          width: 80%;
          height: 6px;
          background-color: #e9ecef;
          border-radius: 3px;
          overflow: hidden;
          margin-top: 1rem;
        }

        .progress-bar {
          height: 100%;
          width: 0;
          background: linear-gradient(to right, #ff385c, #ff8a65);
          border-radius: 3px;
          animation: progress 2s ease infinite;
        }

        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 95%;
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
          text-align: center;
        }

        .footer-content {
          max-width: 1280px;
          margin: 0 auto;
          color: #6c757d;
        }

        .wishlist-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .wishlist-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .back-button:hover {
          color: #333;
        }

        .wishlist-header h1 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
          color: #333;
        }

        .wishlist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          padding: 1rem 0;
        }

        .wishlist-item {
          transition: transform 0.3s ease;
        }

        .wishlist-item:hover {
          transform: translateY(-5px);
        }

        .empty-wishlist {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 2rem;
          background: #f8f9fa;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .empty-icon {
          font-size: 3rem;
          color: #dc3545;
          margin-bottom: 1rem;
        }

        .empty-wishlist h2 {
          margin: 1rem 0;
          color: #333;
        }

        .empty-wishlist p {
          color: #666;
          margin-bottom: 2rem;
        }

        .browse-button {
          display: inline-block;
          padding: 0.8rem 1.5rem;
          background: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .browse-button:hover {
          background: #0056b3;
          transform: translateY(-2px);
        }

        .error-message {
          padding: 1rem;
          margin-bottom: 2rem;
          background: #f8d7da;
          color: #721c24;
          border-radius: 8px;
          text-align: center;
        }

        .loading-destinations {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-top: 1rem;
        }
        
        .destination {
          background: rgba(255, 56, 92, 0.1);
          color: #ff385c;
          padding: 5px 12px;
          border-radius: 15px;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 5px;
          animation: breathe 3s infinite ease-in-out;
        }
        
        .destination:nth-child(1) { animation-delay: 0s; }
        .destination:nth-child(2) { animation-delay: 0.5s; }
        .destination:nth-child(3) { animation-delay: 1s; }
        .destination:nth-child(4) { animation-delay: 1.5s; }
        
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        
        .floating-hearts {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
        }
        
        .floating-heart {
          position: absolute;
          color: rgba(255, 56, 92, 0.1);
          font-size: 20px;
          animation-name: float;
          animation-duration: 10s;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        
        .heart-1 { left: 10%; top: 20%; animation-delay: 0s; font-size: 18px; }
        .heart-2 { left: 20%; top: 60%; animation-delay: 1s; font-size: 24px; }
        .heart-3 { left: 30%; top: 30%; animation-delay: 2s; font-size: 16px; }
        .heart-4 { left: 50%; top: 70%; animation-delay: 3s; font-size: 22px; }
        .heart-5 { left: 65%; top: 40%; animation-delay: 4s; font-size: 19px; }
        .heart-6 { left: 75%; top: 20%; animation-delay: 5s; font-size: 25px; }
        .heart-7 { left: 85%; top: 50%; animation-delay: 6s; font-size: 17px; }
        .heart-8 { left: 90%; top: 80%; animation-delay: 7s; font-size: 21px; }
        
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
          25% { transform: translateY(-20px) rotate(5deg); opacity: 0.3; }
          50% { transform: translateY(-35px) rotate(0deg); opacity: 0.1; }
          75% { transform: translateY(-20px) rotate(-5deg); opacity: 0.3; }
          100% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
        }

        @media (max-width: 768px) {
          .wishlist-page {
            padding: 1rem;
          }

          .wishlist-grid {
            grid-template-columns: 1fr;
          }

          .wishlist-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .loading-content {
            padding: 2rem;
          }
          
          .loading-title {
            font-size: 1.2rem;
          }
          
          .loading-destinations {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Wishlist;