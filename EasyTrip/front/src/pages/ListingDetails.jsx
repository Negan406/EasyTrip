import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Comments from "../components/Comments";
import Notification from "../components/Notification";
import axios from "axios";

const ListingDetails = () => {
  const [listing, setListing] = useState(null);
  const { id } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAlreadyBooked, setIsAlreadyBooked] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [areSelectedDatesAvailable, setAreSelectedDatesAvailable] = useState(true);
  const [unavailableDateRanges, setUnavailableDateRanges] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const reviewsRef = useRef(null);
  const [highlightReviewForm, setHighlightReviewForm] = useState(false);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/800x600?text=No+Image+Available';
    
    // If it's already a full URL
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // For storage paths
    if (imageUrl.includes('storage/') || imageUrl.startsWith('profiles/') || imageUrl.startsWith('listings/')) {
      const cleanPath = imageUrl
        .replace('storage/', '')  // Remove 'storage/' if present
        .replace(/^\/+/, '');     // Remove leading slashes
      return `http://localhost:8000/storage/${cleanPath}`;
    }
    
    // For any other case, assume it's a relative path in storage
    const cleanPath = imageUrl.replace(/^\/+/, '');
    return `http://localhost:8000/storage/${cleanPath}`;
  };

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/api/listings/${id}`);
        console.log('API Response:', response.data); // Debug log
        
        if (response.data && response.data.listing) {
          const listingData = response.data.listing;
          
          // Format the listing data
          const formattedListing = {
            id: listingData.id,
            title: listingData.title,
            description: listingData.description,
            location: listingData.location,
            price: parseFloat(listingData.price),
            mainPhoto: listingData.main_photo,
            photos: listingData.photos?.map(photo => photo.photo_url) || [],
            category: listingData.category,
            host: listingData.host,
            status: listingData.status,
            averageRating: listingData.average_rating ? parseFloat(listingData.average_rating) : 0,
            totalRatings: listingData.total_ratings ? parseInt(listingData.total_ratings) : 0
          };
          
          setListing(formattedListing);
          // Set the main photo as the initially selected photo
          setSelectedPhoto(getImageUrl(listingData.main_photo));
      } else {
          console.error("Invalid response format:", response.data);
          setNotification({
            message: 'Error: Listing not found',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
        setNotification({
          message: 'Error loading listing details. Please try again later.',
          type: 'error'
        });
      } finally {
        // Add a small delay to ensure the spinner is visible
        setTimeout(() => {
          setLoading(false);
        }, 200); // Increased delay for better visibility
      }
    };

    fetchListing();

    // Check if the listing is already booked by the current user
    const checkBookingStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        const response = await axios.get(`http://localhost:8000/api/bookings/check/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setIsAlreadyBooked(response.data.isBooked);
      } catch (error) {
        console.error('Error checking booking status:', error);
      }
    };

    if (localStorage.getItem('isLoggedIn') === 'true') {
      checkBookingStatus();
    }
  }, [id]);

  // Check date availability when both dates are selected
  useEffect(() => {
    if (startDate && endDate && listing) {
      checkDateAvailability();
    }
  }, [startDate, endDate]);

  const checkDateAvailability = async () => {
    if (!startDate || !endDate || !listing) return;
    
    setCheckingAvailability(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.post(
        `http://localhost:8000/api/bookings/check-availability/${id}`,
        {
          start_date: startDate,
          end_date: endDate
        },
        { headers }
      );
      
      if (response.data.success) {
        setAreSelectedDatesAvailable(response.data.is_available);
        
        if (!response.data.is_available) {
          setUnavailableDateRanges(response.data.unavailable_dates);
          setNotification({
            message: 'Selected dates are not available. Please choose different dates.',
            type: 'warning'
          });
        }
      }
    } catch (error) {
      console.error('Error checking date availability:', error);
      setNotification({
        message: 'Error checking date availability. Please try again.',
        type: 'error'
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    // Reset availability status when date changes
    setAreSelectedDatesAvailable(true);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    // Reset availability status when date changes
    setAreSelectedDatesAvailable(true);
  };

  const handleBookNow = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      setNotification({ message: 'Please log in to book this listing.', type: 'error' });
      return;
    }

    if (isAlreadyBooked) {
      setNotification({ message: 'This listing is already booked by you.', type: 'error' });
      return;
    }

    if (!startDate || !endDate) {
      setNotification({ message: 'Please select both check-in and check-out dates.', type: 'error' });
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setNotification({ message: 'Check-in date cannot be in the past.', type: 'error' });
      return;
    }

    if (end <= start) {
      setNotification({ message: 'Check-out date must be after check-in date.', type: 'error' });
      return;
    }

    // Check availability before proceeding to payment
    try {
      setCheckingAvailability(true);
      
      const response = await axios.post(
        `http://localhost:8000/api/bookings/check-availability/${id}`,
        {
          start_date: startDate,
          end_date: endDate
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success && response.data.is_available) {
        // If dates are available, proceed to payment
        navigate('/payment', { 
          state: { 
            listing,
            booking: {
              startDate,
              endDate
            }
          } 
        });
      } else {
        // If dates are not available, show error message
        setAreSelectedDatesAvailable(false);
        setUnavailableDateRanges(response.data.unavailable_dates || []);
        setNotification({
          message: 'Selected dates are not available. Please choose different dates.',
          type: 'warning'
        });
      }
    } catch (error) {
      console.error('Error checking date availability:', error);
      setNotification({
        message: 'Error checking date availability. Please try again.',
        type: 'error'
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  // Format unavailable date ranges for display
  const formatUnavailableDates = () => {
    if (unavailableDateRanges.length === 0) return '';
    
    return unavailableDateRanges.map((range, index) => {
      const start = new Date(range.start_date).toLocaleDateString();
      const end = new Date(range.end_date).toLocaleDateString();
      return `${start} to ${end}${index < unavailableDateRanges.length - 1 ? ', ' : ''}`;
    }).join('');
  };

  // Create array of unique photos with proper URLs
  const allPhotos = listing ? Array.from(new Set([
    getImageUrl(listing.mainPhoto),
    ...listing.photos.map(photo => getImageUrl(photo))
  ])).filter(Boolean) : [];

  // Get success message from navigation state if available
  useEffect(() => {
    if (location.state && location.state.bookingSuccess) {
      setNotification({
        message: location.state.message,
        type: 'success'
      });
      
      // Highlight the review form if redirected from a successful booking
      setHighlightReviewForm(true);
      
      // Scroll to reviews section if requested
      if (location.state.scrollToReviews && reviewsRef.current) {
        setTimeout(() => {
          reviewsRef.current.scrollIntoView({ behavior: 'smooth' });
        }, 1000);
      }
      
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Add listener for rating updates
  useEffect(() => {
    const handleReviewUpdate = (event) => {
      const { listingId, averageRating, totalReviews } = event.detail;
      
      if (parseInt(listingId) === parseInt(id) && listing) {
        setListing(prevListing => ({
          ...prevListing,
          averageRating: parseFloat(averageRating),
          totalRatings: parseInt(totalReviews)
        }));
      }
    };

    window.addEventListener('reviewUpdated', handleReviewUpdate);
    
    return () => {
      window.removeEventListener('reviewUpdated', handleReviewUpdate);
    };
  }, [id, listing]);

  return (
    <div className="page-wrapper">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      
      <div className="content-area">
        {loading ? (
          <div className="loading-container">
            <div className="spinner-wrapper">
              <div className="custom-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-icon">
                  <i className="fas fa-home"></i>
                </div>
              </div>
              <h3 className="loading-title">Loading your perfect getaway...</h3>
              <p className="loading-text">We&apos;re preparing all the details for this listing</p>
              <div className="loading-progress">
                <div className="progress-bar"></div>
              </div>
            </div>
          </div>
        ) : !listing ? (
          <div className="not-found-container">
            <div className="error-content">
              <h2>Listing not found</h2>
              <p>The listing you&apos;re looking for doesn&apos;t exist or has been removed.</p>
              <Link to="/" className="back-link">Return to homepage</Link>
            </div>
          </div>
        ) : (
      <main className="listing-details-page">
        <div className="listing-gallery">
          <div className="main-image">
                <img 
                  src={selectedPhoto || getImageUrl(listing.mainPhoto)} 
                  alt={listing.title}
                  onError={(e) => {
                    console.error('Image failed to load:', {
                      original: listing.mainPhoto,
                      attempted: e.target.src
                    });
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/800x600?text=No+Image+Available';
                  }}
                />
              </div>
              {allPhotos.length > 1 && (
                <div className="photo-grid">
                  {allPhotos.map((photo, index) => (
                    <div 
                      key={index} 
                      className={`photo-thumbnail ${selectedPhoto === photo ? 'selected' : ''}`}
                      onClick={() => handlePhotoClick(photo)}
                    >
                      <img 
                        src={photo} 
                        alt={`${listing.title} - ${index + 1}`}
                        onError={(e) => {
                          console.error('Thumbnail failed to load:', {
                            photo,
                            index
                          });
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150x150?text=Image+Not+Found';
                        }}
                      />
              </div>
            ))}
          </div>
              )}
        </div>

        <div className="listing-content">
          <div className="listing-info-container">
            <div className="listing-header">
              <h1>{listing.title}</h1>
              <div className="listing-meta">
                <div className="location">
                  <i className="fas fa-map-marker-alt"></i> {listing.location}
                </div>
                <div className="category">
                  Category: {listing.category}
                </div>
                {listing.averageRating > 0 && (
                  <div className="listing-rating">
                    <i className="fas fa-star"></i> {listing.averageRating.toFixed(1)}
                    <span className="review-count">
                      ({listing.totalRatings} {listing.totalRatings === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {listing.host && (
              <div className="host-info">
                    <div className="host-photo-container">
                      <img 
                        src={getImageUrl(listing.host.profile_photo)} 
                        alt={listing.host.name} 
                        className="host-avatar"
                        onError={(e) => {
                          console.error('Host photo failed to load:', {
                            original: listing.host.profile_photo,
                            attempted: e.target.src
                          });
                          e.target.src = 'https://via.placeholder.com/150x150?text=Host';
                        }}
                      />
                    </div>
                <div className="host-details">
                  <h3>Hosted by {listing.host.name}</h3>
                      {listing.host.bio && <p>{listing.host.bio}</p>}
                      {listing.host.phone && (
                        <p className="host-contact">
                          <i className="fas fa-phone"></i> {listing.host.phone}
                        </p>
                      )}
                </div>
              </div>
            )}

            <div className="listing-description">
              <p>{listing.description}</p>
            </div>

                <div className="reviews-section" ref={reviewsRef}>
                  <Comments 
                    listingId={id.toString()} 
                    userName={localStorage.getItem('userName')}
                    isLoggedIn={localStorage.getItem('isLoggedIn') === 'true'}
                    highlightReviewForm={highlightReviewForm}
                    initialRating={listing?.averageRating || 0}
                    initialReviewCount={listing?.totalRatings || 0}
                    key={`reviews-${id}`}
                  />
                </div>
          </div>

          <div className="booking-card">
            <div className="booking-price">
                  <h2>${listing.price} <span className="per-night">night</span></h2>
            </div>
            <form className="booking-form" onSubmit={handleBookNow}>
              <div className="date-inputs">
                <input 
                  type="date" 
                  placeholder="Check-in" 
                  value={startDate} 
                  onChange={handleStartDateChange} 
                  required 
                  min={new Date().toISOString().split('T')[0]}
                />
                <input 
                  type="date" 
                  placeholder="Check-out" 
                  value={endDate} 
                  onChange={handleEndDateChange} 
                  required 
                  min={startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
              <input type="number" min="1" max="16" placeholder="Guests" required />
              
              {!areSelectedDatesAvailable && unavailableDateRanges.length > 0 && (
                <div className="date-error">
                  <p>Selected dates are not available.</p>
                  <p>Unavailable dates: {formatUnavailableDates()}</p>
                </div>
              )}
                  
              <button 
                type="submit" 
                className="book-button" 
                disabled={isAlreadyBooked || checkingAvailability || !areSelectedDatesAvailable}
              >
                {isAlreadyBooked 
                  ? 'Already Booked' 
                  : checkingAvailability 
                    ? 'Checking Availability...' 
                    : !areSelectedDatesAvailable 
                      ? 'Dates Not Available' 
                      : 'Book now'}
              </button>
            </form>
          </div>
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
          position: relative;
        }

        .content-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 70vh;
          flex: 1;
          background-color: #f8f9fa;
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
          border-top-color: #007bff;
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
          border-top-color: #28a745;
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
          border-top-color: #dc3545;
          border-radius: 50%;
          animation: spin 1.5s linear infinite reverse;
        }

        .spinner-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 2rem;
          color: #007bff;
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
          margin-top: 1rem;
        }

        .progress-bar {
          height: 100%;
          width: 0;
          background: linear-gradient(to right, #007bff, #28a745);
          border-radius: 3px;
          animation: progress 2s ease infinite;
        }

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

        .error-content {
          text-align: center;
          padding: 2rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .error-content h2 {
          margin-bottom: 1rem;
          color: #dc3545;
        }

        .error-content p {
          margin-bottom: 1.5rem;
          color: #6c757d;
        }

        .back-link {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .back-link:hover {
          background-color: #0056b3;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

        .listing-details-page {
          width: 100%;
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
          }

          .listing-gallery {
            margin-bottom: 2rem;
          }

          .main-image {
            position: relative;
            width: 100%;
            height: 400px;
            border-radius: 12px;
            overflow: hidden;
          margin-bottom: 1rem;
          background: #f8f9fa;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          .main-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          transition: transform 0.3s ease;
        }

        .main-image:hover img {
          transform: scale(1.02);
          }

        .photo-grid {
            display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
          margin-top: 1rem;
          }

        .photo-thumbnail {
            position: relative;
          height: 100px;
          border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
          transition: all 0.3s ease;
          background: #f8f9fa;
        }

        .photo-thumbnail:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .photo-thumbnail.selected {
          border: 2px solid var(--primary-color, #007bff);
        }

        .photo-thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .listing-content {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
            margin-top: 2rem;
          }

        .listing-header {
          margin-bottom: 2rem;
        }

        .listing-header h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .listing-meta {
          display: flex;
          gap: 1rem;
          color: #666;
          margin-top: 0.5rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .listing-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #222;
          padding: 0.4rem 0.8rem;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }

        .listing-rating:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .listing-rating i {
          color: #FFD700;
          font-size: 1.1rem;
        }

        .review-count {
          font-size: 0.9rem;
          color: #555;
          margin-left: 0.3rem;
        }

        .host-info {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          margin: 2rem 0;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .host-photo-container {
          flex-shrink: 0;
        }

        .host-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }

        .host-avatar:hover {
          transform: scale(1.05);
        }

        .host-details {
          flex: 1;
        }

        .host-details h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.3rem;
          color: #333;
        }

        .host-details p {
          margin: 0.5rem 0;
          color: #666;
          line-height: 1.5;
        }

        .host-contact {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          color: #555;
        }

        .host-contact i {
          color: #007bff;
        }

        .listing-description {
          margin: 2rem 0;
          line-height: 1.6;
          }

          .booking-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: sticky;
            top: 2rem;
            height: fit-content;
          }

        .booking-price {
          margin-bottom: 1.5rem;
        }

        .booking-price h2 {
          font-size: 1.5rem;
          margin: 0;
        }

        .per-night {
          font-size: 1rem;
          color: #666;
        }

          .booking-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .date-inputs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

        .date-inputs input,
        .booking-form input[type="number"] {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }

        .date-error {
          padding: 0.75rem;
          background-color: #fff3cd;
          border: 1px solid #ffeeba;
          border-radius: 8px;
          color: #856404;
          font-size: 0.9rem;
        }

        .date-error p {
          margin: 0.25rem 0;
        }

          .book-button {
          background: var(--primary-color, #007bff);
            color: white;
            padding: 1rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
          transition: background-color 0.3s ease;
        }

        .book-button:not(:disabled):hover {
          background: var(--primary-color-dark, #0056b3);
          }

          .book-button:disabled {
            background: #ccc;
            cursor: not-allowed;
          }

          @media (max-width: 768px) {
            .listing-content {
              grid-template-columns: 1fr;
            }

            .main-image {
              height: 300px;
            }

          .photo-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }

          .booking-card {
            position: static;
            margin-top: 2rem;
          }

          .host-info {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 1rem;
          }

          .host-avatar {
            width: 80px;
            height: 80px;
            margin-bottom: 1rem;
          }

          .host-contact {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ListingDetails;