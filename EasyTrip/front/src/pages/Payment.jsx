import { useState } from "react";
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
  const navigate = useNavigate();
  const location = useLocation();
  const { listing, booking } = location.state || {};

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

      if (response.data) {
        setNotification({ 
          message: response.data.message || 'Booking successful!', 
          type: 'success' 
        });
        
        // Redirect back to the listing page after successful booking
        setTimeout(() => {
          navigate(`/listing/${listing.id}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Booking error:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || 'Failed to create booking. Please try again.';
      
      setNotification({ 
        message: errorMessage,
        type: 'error' 
      });
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
        <button type="submit" className="cta-button" disabled={loading}>
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    
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
      `}</style>
    </div>
  );
};

export default Payment;