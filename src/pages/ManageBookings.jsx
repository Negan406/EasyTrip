import { useState, useEffect } from "react";
import Notification from "../components/Notification";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const storedBookings = JSON.parse(localStorage.getItem('bookings')) || [];
    setBookings(storedBookings);
  }, []);

  const handleAcceptBooking = (index) => {
    const updatedBookings = [...bookings];
    updatedBookings[index].status = 'accepted';
    setBookings(updatedBookings);
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));

    // Notify the user
    const trips = JSON.parse(localStorage.getItem('trips')) || [];
    const tripIndex = trips.findIndex(trip => trip.id === updatedBookings[index].id);
    if (tripIndex !== -1) {
      trips[tripIndex].status = 'accepted';
      localStorage.setItem('trips', JSON.stringify(trips));
    }

    setNotification({ message: 'Booking accepted!', type: 'success' });
  };

  const handleRefuseBooking = (index) => {
    const updatedBookings = [...bookings];
    updatedBookings[index].status = 'refused';
    setBookings(updatedBookings);
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));

    // Notify the user
    const trips = JSON.parse(localStorage.getItem('trips')) || [];
    const tripIndex = trips.findIndex(trip => trip.id === updatedBookings[index].id);
    if (tripIndex !== -1) {
      trips[tripIndex].status = 'refused';
      localStorage.setItem('trips', JSON.stringify(trips));
    }

    setNotification({ message: 'Booking refused!', type: 'error' });
  };

  const handleDeleteBooking = (index) => {
    const updatedBookings = bookings.filter((_, i) => i !== index);
    setBookings(updatedBookings);
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    setNotification({ message: 'Booking deleted!', type: 'success' });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <div className="manage-bookings-container">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      <h1>Manage Bookings</h1>
      <ul>
        {bookings.map((booking, index) => (
          <li key={index} className="booking-item">
            <img src={booking.listing.photo} alt={booking.listing.title} className="booking-image" />
            <div className="booking-details">
              <p>{booking.listing.title} - {booking.startDate} to {booking.endDate}</p>
              <p>Name: {booking.guestName}</p>
              <p>Number of Guests: {booking.guestCount}</p>
              <p>Status: {booking.status || 'pending'}</p>
              <button onClick={() => handleAcceptBooking(index)} className="accept-button">Accept</button>
              <button onClick={() => handleRefuseBooking(index)} className="refuse-button">Refuse</button>
              {booking.status === 'refused' && (
                <button onClick={() => handleDeleteBooking(index)} className="delete-booking-button">Delete</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageBookings; 