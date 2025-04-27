import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Notification from "../components/Notification";

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
  const navigate = useNavigate();
  const location = useLocation();
  const { listing, startDate, endDate } = location.state || {};
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails({ ...paymentDetails, [name]: value });
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userEmail = localStorage.getItem('email');
    
    if (!isLoggedIn) {
      setNotification({ message: 'You must be logged in to complete payment.', type: 'error' });
      return;
    }

    // Show success notification
    setNotification({ message: 'Payment successful!', type: 'success' });
    setPaymentSuccess(true);

    // Save booking details
    const booking = { 
      id: Date.now(), 
      listing: {
        id: listing.id,
        title: listing.title,
        location: listing.location,
        price: listing.price,
        mainPhoto: listing.mainPhoto || listing.photo
      },
      startDate, 
      endDate, 
      guestName, 
      guestCount,
      userEmail,
      paymentStatus: 'completed',  // Mark payment as completed
      status: 'confirmed'  // Update status to confirmed
    };

    try {
      const trips = JSON.parse(localStorage.getItem('trips')) || [];
      trips.push(booking);
      localStorage.setItem('trips', JSON.stringify(trips));

      const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
      bookings.push(booking);
      localStorage.setItem('bookings', JSON.stringify(bookings));

      // Redirect back to the listing page after payment
      setTimeout(() => {
        navigate(`/listing/${listing.id}`);
      }, 2000);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        alert('Storage limit exceeded. Please clear some data.');
      } else {
        console.error('Failed to update trips or bookings:', error);
      }
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  if (!listing) {
    return (
      <div className="payment-container">
        <h1>Error: Listing information not found</h1>
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
      <p>From: {startDate} To: {endDate}</p>
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
        <button type="submit" className="cta-button">Pay Now</button>
      </form>
      {paymentSuccess && <p>Payment successful! Redirecting to listing page...</p>}
    
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
        
        .cta-button:hover {
          background: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default Payment;