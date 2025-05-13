import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Notification from "../components/Notification";
import axios from "axios";

const Payment = () => {
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: ''
  });
  const [guestName, setGuestName] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { listing, booking } = location.state || {};

  // Check availability when component mounts
  useEffect(() => {
    if (listing && booking) {
      checkDateAvailability();
    }
  }, []);

  const checkDateAvailability = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      setNotification({ message: 'You must be logged in to complete payment.', type: 'error' });
      return false;
    }

    setCheckingAvailability(true);

    try {
      // Format dates to match backend expectations (YYYY-MM-DD)
      const formattedStartDate = booking.startDate.split('T')[0];
      const formattedEndDate = booking.endDate.split('T')[0];

      const response = await axios.post(
        `http://localhost:8000/api/bookings/check-availability/${listing.id}`,
        {
          start_date: formattedStartDate,
          end_date: formattedEndDate
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.success || !response.data.is_available) {
        setNotification({
          message: 'These dates are no longer available. Please choose different dates.',
          type: 'error'
        });
        
        // Redirect back to the listing page after 3 seconds
        setTimeout(() => {
          navigate(`/listing/${listing.id}`);
        }, 3000);
        
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Availability check error:', error);
      setNotification({
        message: 'Error checking date availability. Please try again.',
        type: 'error'
      });
      return false;
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails({ ...paymentDetails, [name]: value });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      setNotification({ message: 'You must be logged in to complete payment.', type: 'error' });
      return;
    }

    // Validate dates
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      setNotification({ message: 'Check-in date cannot be in the past.', type: 'error' });
      return;
    }

    if (endDate <= startDate) {
      setNotification({ message: 'Check-out date must be after check-in date.', type: 'error' });
      return;
    }

    // Check if dates are still available
    const isAvailable = await checkDateAvailability();
    if (!isAvailable) {
      return;
    }

    setLoading(true);

    try {
      // Configure axios with the auth token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Format dates to match backend expectations (YYYY-MM-DD)
      const formattedStartDate = booking.startDate.split('T')[0];
      const formattedEndDate = booking.endDate.split('T')[0];

      // Create the booking
      const response = await axios.post('http://localhost:8000/api/bookings', {
        listing_id: listing.id,
        start_date: formattedStartDate,
        end_date: formattedEndDate
      });

      if (response.data && response.data.success) {
        setNotification({ 
          message: response.data.message || 'Booking successful!', 
          type: 'success' 
        });
        
        // Redirect back to the listing page after successful booking
        setTimeout(() => {
          navigate(`/listing/${listing.id}`, { 
            state: { 
              bookingSuccess: true,
              message: 'Booking completed successfully! We hope you enjoy your stay. Don\'t forget to leave a review after your visit.',
              scrollToReviews: true
            }
          });
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      
      // Handle 409 Conflict (dates not available)
      if (error.response && error.response.status === 409) {
        setNotification({ 
          message: 'These dates are no longer available. Please choose different dates.',
          type: 'error' 
        });
        
        // Redirect back to the listing page after 3 seconds
        setTimeout(() => {
          navigate(`/listing/${listing.id}`);
        }, 3000);
      } else {
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error 
          || 'Failed to create booking. Please try again.';
        
        setNotification({ 
          message: errorMessage,
          type: 'error' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  if (!listing || !booking) {
    return (
      <div className="payment-container">
        <h1>Error: Booking information not found</h1>
        <p>Please go back and try again.</p>
        <button onClick={() => navigate(-1)} className="cta-button">Go Back</button>
      </div>
    );
  }

  return (
    <div className="payment-container">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      <h1>Payment for {listing.title}</h1>
      <p>Location: {listing.location}</p>
      <p>Price: ${listing.price} per night</p>
      <p>From: {booking.startDate} To: {booking.endDate}</p>
      
      {checkingAvailability ? (
        <div className="availability-checking">
          <p>Checking date availability...</p>
        </div>
      ) : (
        <form onSubmit={handlePaymentSubmit} className="payment-form">
          <input
            type="text"
            name="cardHolderName"
            placeholder="Cardholder Name"
            value={paymentDetails.cardHolderName}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="guestName"
            placeholder="Full Name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
          />
          <input
            type="number"
            name="guestCount"
            placeholder="Number of Guests"
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            min="1"
            required
          />
          <input
            type="text"
            name="cardNumber"
            placeholder="Card Number"
            value={paymentDetails.cardNumber}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="expiryDate"
            placeholder="Expiry Date (MM/YY)"
            value={paymentDetails.expiryDate}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="cvv"
            placeholder="CVV"
            value={paymentDetails.cvv}
            onChange={handleInputChange}
            required
          />
          <button type="submit" className="cta-button" disabled={loading || checkingAvailability}>
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
      )}
    
      <style>{`
        .payment-container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .payment-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        input {
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        
        .cta-button {
          padding: 1rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.3s ease;
        }
        
        .cta-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .cta-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .availability-checking {
          text-align: center;
          padding: 2rem;
          margin-top: 1.5rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #f9f9f9;
        }
      `}</style>
    </div>
  );
};

export default Payment;