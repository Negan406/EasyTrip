import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Sidebar from "../components/Sidebar";
import Notification from "../components/Notification";
import ConfirmationModal from "../components/ConfirmationModal";

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);

  useEffect(() => {
    try {
      const storedTrips = JSON.parse(localStorage.getItem('trips')) || [];
      setTrips(storedTrips);
    } catch (error) {
      console.error("Failed to load trips:", error);
      setNotification({ message: 'Failed to load trips.', type: 'error' });
    }
  }, []);

  const handleDeleteTrip = (index) => {
    if (trips[index].status === 'accepted') {
      setNotification({ message: 'Cannot delete an accepted trip.', type: 'error' });
      return;
    }
    setTripToDelete(index);
    setShowModal(true);
  };

  const confirmDelete = () => {
    const updatedTrips = trips.filter((_, i) => i !== tripToDelete);
    setTrips(updatedTrips);
    localStorage.setItem('trips', JSON.stringify(updatedTrips));
    setNotification({ message: 'Trip deleted!', type: 'success' });
    setShowModal(false);
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <>
      <Sidebar />
      <main className="trips-container">
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={closeNotification}
          />
        )}
        {showModal && (
          <ConfirmationModal
            message="Are you sure you want to delete this trip?"
            onConfirm={confirmDelete}
            onCancel={() => setShowModal(false)}
          />
        )}
        <h1>Your Trips</h1>
       
        <div className="trips-list">
          {trips.length === 0 ? (
            <div className="no-trips-message">
              <FontAwesomeIcon icon={["fas", "suitcase-rolling"]} />
              <h2>No trips yet</h2>
              <p>Time to dust off your bags and start planning your next adventure</p>
              <a href="/" className="cta-button">Start searching</a>
            </div>
          ) : (
            trips.map((trip, index) => (
              <div key={index} className="trip-item">
                <img src={trip.listing?.photo || ''} alt={trip.listing?.title || 'Trip Image'} className="trip-image" />
                <div className="trip-details">
                  <h3>{trip.listing?.title || 'Unknown Title'}</h3>
                  <p>{trip.listing?.location || 'Unknown Location'}</p>
                  <p>From: {trip.startDate || 'N/A'} To: {trip.endDate || 'N/A'}</p>
                  <p>Status: {trip.status || 'pending'}</p>
                  <button onClick={() => handleDeleteTrip(index)} className="delete-trip-button">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
};

export default Trips;