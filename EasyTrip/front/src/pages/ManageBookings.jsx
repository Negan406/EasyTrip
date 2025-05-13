import { useState, useEffect } from "react";
import Notification from "../components/Notification";
import LoadingSpinner from "../components/LoadingSpinner";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

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
    const fetchHostBookings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Authentication required');
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('http://localhost:8000/api/bookings/host');
        
        if (response.data && response.data.data) {
          setBookings(response.data.data);
        } else {
          setBookings([]);
        }
      } catch (error) {
        console.error("Error loading bookings:", error);
        setNotification({
          message: error.response?.status === 404 
            ? 'No bookings found for your listings'
            : error.message === 'Authentication required' 
              ? 'Please log in to view your listings\' bookings'
              : 'Failed to load bookings. Please try again.',
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchHostBookings();
  }, []);

  const handleAcceptBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await axios.post(`http://localhost:8000/api/bookings/${bookingId}/accept`);

      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'accepted' }
            : booking
        )
      );
      
      setNotification({ message: 'Booking accepted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error accepting booking:', error);
      setNotification({
        message: error.response?.data?.message || 'Failed to accept booking. Please try again.',
        type: 'error'
      });
    }
  };

  const handleRefuseBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await axios.post(`http://localhost:8000/api/bookings/${bookingId}/refuse`);

      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'refused' }
            : booking
        )
      );
      
      setNotification({ message: 'Booking refused successfully!', type: 'success' });
    } catch (error) {
      console.error('Error refusing booking:', error);
      setNotification({
        message: error.response?.data?.message || 'Failed to refuse booking. Please try again.',
        type: 'error'
      });
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content-area">
          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={closeNotification}
            />
          )}
        
        <h1 className="page-title">Manage Listing Bookings</h1>
        
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="bookings-content">
            {!bookings || bookings.length === 0 ? (
              <div className="no-results-message">No bookings found for your listings</div>
            ) : (
              <div className="bookings-list">
                {bookings.map((booking) => (
                  <div key={booking.id} className="booking-item" data-aos="fade-up">
                    <div className="booking-image-container">
                      <img 
                        src={getImageUrl(booking.listing?.main_photo)} 
                        alt={booking.listing?.title || 'Listing'} 
                        className="booking-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                      <div className="booking-status-badge">
                        <span className={`status-${booking.payment_status || 'pending'}`}>
                          {(booking.payment_status || 'pending').charAt(0).toUpperCase() + 
                           (booking.payment_status || 'pending').slice(1)}
                        </span>
                      </div>
                    </div>
                  <div className="booking-details">
                      <h3>{booking.listing?.title || 'Listing not available'}</h3>
                      <div className="guest-info">
                        <FontAwesomeIcon icon={faUser} className="guest-icon" />
                        <span>{booking.user?.name || 'Anonymous'}</span>
                      </div>
                      <div className="booking-dates">
                        <div className="date-item">
                          <span className="date-label">Check-in:</span>
                          <span className="date-value">{formatDate(booking.start_date)}</span>
                        </div>
                        <div className="date-item">
                          <span className="date-label">Check-out:</span>
                          <span className="date-value">{formatDate(booking.end_date)}</span>
                        </div>
                      </div>
                      <div className="booking-price">
                        <span className="price-label">Total Price:</span>
                        <span className="price-value">${parseFloat(booking.total_price || 0).toFixed(2)}</span>
                      </div>
                      {booking.payment_status === 'pending' && (
                        <div className="booking-actions">
                          <button 
                            onClick={() => handleAcceptBooking(booking.id)}
                            className="accept-button"
                          >
                            Accept Payment
                          </button>
                          <button 
                            onClick={() => handleRefuseBooking(booking.id)}
                            className="refuse-button"
                          >
                            Refuse Payment
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
              ))}
              </div>
          )}
        </div>
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
          background-color: #f8f9fa;
        }
        
        .content-area {
          flex: 1;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        
        .page-title {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 2rem;
          font-size: 2.5rem;
          font-weight: 700;
        }
        
        .bookings-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
          padding: 1rem;
        }
        
        .booking-item {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .booking-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        
        .booking-image-container {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
        }
        
        .booking-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .booking-item:hover .booking-image {
          transform: scale(1.05);
        }
        
        .booking-status-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .booking-details {
          padding: 1.5rem;
        }
        
        .booking-details h3 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
          font-size: 1.4rem;
          font-weight: 600;
          line-height: 1.3;
        }
        
        .guest-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: #2c3e50;
          font-size: 1.1rem;
        }
        
        .guest-icon {
          color: #666;
        }
        
        .booking-dates {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 10px;
        }
        
        .date-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .date-label {
          color: #666;
          font-weight: 500;
        }
        
        .date-value {
          color: #2c3e50;
          font-weight: 600;
        }
        
        .booking-price {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 10px;
          font-size: 1.1rem;
        }
        
        .price-label {
          color: #666;
          font-weight: 500;
        }
        
        .price-value {
          color: #2c3e50;
          font-weight: 600;
        }
        
        .status-pending {
          color: #f39c12;
          font-weight: 600;
        }
        
        .status-completed {
          color: #27ae60;
          font-weight: 600;
        }
        
        .status-cancelled {
          color: #e74c3c;
          font-weight: 600;
        }
        
        .booking-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .accept-button,
        .refuse-button {
          padding: 0.8rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .accept-button {
          background-color: #27ae60;
          color: white;
        }
        
        .accept-button:hover {
          background-color: #219a52;
          transform: translateY(-2px);
        }
        
        .refuse-button {
          background-color: #e74c3c;
          color: white;
        }
        
        .refuse-button:hover {
          background-color: #c0392b;
          transform: translateY(-2px);
        }
        
        .no-results-message {
          text-align: center;
          margin: 3rem auto;
          padding: 2rem;
          background: white;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          max-width: 500px;
          font-size: 1.2rem;
          color: #666;
        }
        
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }
        
        @media (max-width: 768px) {
          .content-area {
            padding: 1rem;
          }
          
          .bookings-list {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            padding: 0.5rem;
          }
          
          .page-title {
            font-size: 2rem;
            margin-bottom: 1.5rem;
          }
          
          .booking-details {
            padding: 1rem;
          }
          
          .booking-actions {
            grid-template-columns: 1fr;
          }
          
          .accept-button,
          .refuse-button {
            padding: 0.7rem;
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ManageBookings;