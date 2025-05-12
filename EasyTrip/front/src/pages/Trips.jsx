import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faMapMarkerAlt, faClock } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/Sidebar";
import Notification from "../components/Notification";
import ConfirmationModal from "../components/ConfirmationModal";
import LoadingSpinner from "../components/LoadingSpinner";
import axios from "axios";

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
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
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Authentication required');
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('http://localhost:8000/api/bookings');
        
        if (response.data && response.data.data) {
          setTrips(response.data.data);
        } else {
          setTrips([]);
        }
      } catch (error) {
        console.error("Failed to load trips:", error);
        setNotification({
          message: error.message === 'Authentication required' 
            ? 'Please log in to view your trips'
            : 'Failed to load your trips. Please try again.',
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const handleDeleteTrip = async (bookingId) => {
    try {
      const booking = trips.find(trip => trip.id === bookingId);
      if (booking?.payment_status === "completed") {
        setNotification({ message: "Cannot cancel a completed booking.", type: "error" });
        return;
      }
      setTripToDelete(bookingId);
      setShowModal(true);
    } catch (error) {
      console.error('Error handling delete:', error);
      setNotification({ message: "Failed to process deletion.", type: "error" });
    }
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await axios.delete(`http://localhost:8000/api/bookings/${tripToDelete}`);

      setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripToDelete));
      setNotification({ message: "Trip cancelled successfully!", type: "success" });
    } catch (error) {
      console.error('Error deleting trip:', error);
      setNotification({ message: "Failed to cancel trip. Please try again.", type: "error" });
    } finally {
      setShowModal(false);
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#27ae60';
      case 'cancelled':
        return '#e74c3c';
      case 'pending':
        return '#f39c12';
      default:
        return '#95a5a6';
    }
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="content-area">
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={closeNotification}
          />
        )}
        
        {showModal && (
          <ConfirmationModal
            message="Are you sure you want to cancel this trip?"
            onConfirm={confirmDelete}
            onCancel={() => setShowModal(false)}
          />
        )}
        
        <h1 className="page-title">Your Trips</h1>

        {loading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="trips-list">
            {!trips || trips.length === 0 ? (
              <div className="no-trips-message">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <h2>No trips yet</h2>
                <p>Time to dust off your bags and start planning your next adventure</p>
                <a href="/" className="cta-button">Start searching</a>
              </div>
            ) : (
              trips.map((trip) => {
                const paymentStatus = trip.payment_status || 'pending';
                
                return (
                  <div key={trip.id} className="trip-item">
                    <div className="trip-status" style={{ backgroundColor: getStatusColor(paymentStatus) }}>
                      {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                    </div>
                    {paymentStatus === 'pending' ? (
                      // Pending booking layout
                      <div className="pending-trip-content">
                        <h3>{trip.listing?.title || "Unknown Location"}</h3>
                        <div className="pending-trip-info">
                          <div className="pending-dates">
                            <div className="date-item">
                              <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
                              <div className="date-details">
                                <span className="date-label">Check-in:</span>
                                <span className="date-value">{formatDate(trip.start_date)}</span>
                              </div>
                            </div>
                            <div className="date-item">
                              <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
                              <div className="date-details">
                                <span className="date-label">Check-out:</span>
                                <span className="date-value">{formatDate(trip.end_date)}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteTrip(trip.id)}
                            className="cancel-trip-button"
                          >
                            Cancel Booking
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Accepted/Complete booking layout with full details
                      <>
                        <img
                          src={getImageUrl(trip.listing?.main_photo)}
                          alt={trip.listing?.title || "Trip Image"}
                          className="trip-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                          }}
                        />
                        <div className="trip-details">
                          <h3>{trip.listing?.title || "Unknown Location"}</h3>
                          <div className="trip-info">
                            <p>
                              <FontAwesomeIcon icon={faMapMarkerAlt} />
                              {trip.listing?.location || "Location not available"}
                            </p>
                            <p>
                              <FontAwesomeIcon icon={faCalendarAlt} />
                              {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                            </p>
                            <p>
                              <FontAwesomeIcon icon={faClock} />
                              Total Price: ${parseFloat(trip.total_price || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
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
          min-height: 300px;
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
        
        .page-title {
          text-align: center;
          margin-bottom: 2rem;
          color: #333;
          font-size: 2.5em;
        }
        
        .trips-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          padding: 1rem 0;
        }
        
        .trip-item {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
          position: relative;
        }
        
        .trip-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .trip-status {
          position: absolute;
          top: 15px;
          right: 15px;
          padding: 8px 15px;
          color: white;
          border-radius: 25px;
          font-size: 0.9em;
          font-weight: 600;
          z-index: 1;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        .trip-image {
          width: 100%;
          height: 220px;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .trip-item:hover .trip-image {
          transform: scale(1.05);
        }
        
        .trip-details {
          padding: 1.5rem;
        }
        
        .trip-details h3 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
          font-size: 1.4em;
          font-weight: 600;
        }
        
        .trip-info {
          margin-bottom: 1.5rem;
        }
        
        .trip-info p {
          margin: 0.8rem 0;
          color: #666;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.95em;
        }
        
        .trip-info svg {
          color: #007bff;
          width: 16px;
          min-width: 16px;
        }
        
        .cancel-trip-button {
          background: #dc3545;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          width: 100%;
          font-weight: 600;
          transition: all 0.3s ease;
          font-size: 1em;
        }
        
        .cancel-trip-button:hover {
          background: #c82333;
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(220, 53, 69, 0.4);
        }
        
        .no-trips-message {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          grid-column: 1 / -1;
        }
        
        .no-trips-message svg {
          font-size: 3rem;
          color: #007bff;
          margin-bottom: 1.5rem;
        }
        
        .no-trips-message h2 {
          color: #333;
          margin-bottom: 1rem;
          font-size: 1.8em;
        }
        
        .no-trips-message p {
          color: #666;
          margin-bottom: 2rem;
          font-size: 1.1em;
        }
        
        .cta-button {
          display: inline-block;
          background: #007bff;
          color: white;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .cta-button:hover {
          background: #0056b3;
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 123, 255, 0.4);
        }

        @media (max-width: 768px) {
          .content-area {
            padding: 1rem;
          }
          
          .trips-list {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .page-title {
            font-size: 2rem;
            margin-bottom: 1.5rem;
          }

          .trip-image {
            height: 200px;
          }

          .trip-details {
            padding: 1.2rem;
          }

          .trip-details h3 {
            font-size: 1.3em;
          }
        }

        .pending-trip-content {
          padding: 1.5rem;
          background: #f8f9fa;
        }

        .pending-trip-content h3 {
          color: #2c3e50;
          font-size: 1.4em;
          font-weight: 600;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #e9ecef;
          padding-bottom: 1rem;
        }

        .pending-trip-info {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .pending-dates {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: white;
          padding: 1.2rem;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .date-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .date-icon {
          color: #007bff;
          font-size: 1.2em;
          width: 20px;
        }

        .date-details {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .date-label {
          font-size: 0.9em;
          color: #666;
          font-weight: 500;
        }

        .date-value {
          font-size: 1.1em;
          color: #2c3e50;
          font-weight: 600;
        }

        .cancel-trip-button {
          background: #dc3545;
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          text-align: center;
          width: 100%;
          font-size: 1em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .cancel-trip-button:hover {
          background: #c82333;
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(220, 53, 69, 0.4);
        }

        @media (max-width: 768px) {
          .pending-trip-content {
            padding: 1.2rem;
          }

          .pending-trip-content h3 {
            font-size: 1.2em;
            margin-bottom: 1rem;
          }

          .pending-dates {
            padding: 1rem;
          }

          .date-value {
            font-size: 1em;
          }
        }
      `}</style>
    </div>
  );
};

export default Trips;
