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
    <div className="page-container">
      <div className="content-wrap">
        <div className="container-center">
          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={closeNotification}
            />
          )}
          <h1 className="page-title">Manage Bookings</h1>
          {bookings.length === 0 ? (
            <div className="no-results-message">No bookings found</div>
          ) : (
            <ul className="bookings-list">
              {bookings.map((booking, index) => (
                <li key={index} className="booking-item">
                  <img src={booking.listing.mainPhoto || booking.listing.photo} alt={booking.listing.title} className="booking-image" />
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
          )}
        </div>
      </div>
      <style jsx>{`
        .page-container {
          min-height: 100vh;
          position: relative;
          padding-bottom: 60px;
        }
        .content-wrap {
          padding-bottom: 2.5rem;
        }
        .no-results-message {
          text-align: center;
          margin-top: 50px;
          font-size: 1.2em;
          color: #666;
        }
        .container-center {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .page-title {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 30px;
          font-size: 2.5em;
        }
        .bookings-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          padding: 0;
          list-style: none;
        }
        .booking-item {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 15px;
          transition: transform 0.2s;
        }
        .booking-item:hover {
          transform: translateY(-5px);
        }
        .booking-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 4px;
        }
        .booking-details {
          padding: 15px 0;
        }
      `}</style>
    </div>
  );
};

export default ManageBookings;