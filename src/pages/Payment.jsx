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
    // Here you would typically handle the payment processing

    // Show success notification
    setNotification({ message: 'Payment successful!', type: 'success' });

    // Save booking details
    const booking = { 
      id: Date.now(), 
      listing: {
        id: listing.id,
        title: listing.title,
        location: listing.location,
        price: listing.price,
        mainPhoto: listing.mainPhoto
      },
      startDate, 
      endDate, 
      guestName, 
      guestCount, 
      status: 'pending'  // Set initial status to 'pending'
    };

    try {
      const trips = JSON.parse(localStorage.getItem('trips')) || [];
      trips.push(booking);
      localStorage.setItem('trips', JSON.stringify(trips));

      const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
      bookings.push(booking);
      localStorage.setItem('bookings', JSON.stringify(bookings));

      setTimeout(() => {
        navigate('/trips');
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
      {paymentSuccess && <p>Payment successful! Redirecting to your trips...</p>}
    </div>
  );
};

export default Payment;