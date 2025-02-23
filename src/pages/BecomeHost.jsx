import { useState } from "react";
import Sidebar from "../components/Sidebar";
import HostRegistrationModal from "../components/HostRegistrationModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from 'react-router-dom';
import Notification from "../components/Notification";

const BecomeHost = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newListing, setNewListing] = useState({
    title: '',
    location: '',
    price: '',
    photo: '',
    description: ''
  });
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewListing({ ...newListing, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save the new listing to localStorage or send it to a backend
    const listings = JSON.parse(localStorage.getItem('listings')) || [];
    listings.push(newListing);
    localStorage.setItem('listings', JSON.stringify(listings));
    navigate('/'); // Redirect to Home page
  };

  const handleGetStarted = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      navigate('/add-listing');
    } else {
      navigate('/login');
    }
  };

  const handleManageListings = () => {
    navigate('/manage-listings');
  };

  const handleManageBookings = () => {
    navigate('/manage-bookings');
  };

  const handleBookNow = (e) => {
    e.preventDefault();
    if (isAlreadyBooked) {
      setNotification({ message: 'This listing is already booked by you.', type: 'error' });
      return;
    }

    navigate('/payment', { state: { listing, startDate, endDate } });
  };

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <main className="host-header">
        <h1>Become a Host</h1>
        <p>Earn extra income and unlock new opportunities by sharing your space</p>
        <button  style={{position: 'relative', right: '10px',backgroundColor: 'rgb(11, 226, 11)',color: 'white'}} className="cta-button" onClick={handleGetStarted}>
          Get Started 
        </button>   {isLoggedIn && (
           <button style={{backgroundColor: 'rgb(11, 226, 11)',color: 'white'}} className="cta-button" onClick={handleManageListings}>
            Manage Listings
          </button>
        )}
        {isLoggedIn && (
          <button style={{position: 'relative', left: '10px',backgroundColor: 'rgb(11, 226, 11)',color: 'white'}} onClick={handleManageBookings} className="cta-button">Manage Bookings</button>
        )}
      </main>
      <div className="host-features">
        {[{ icon: "fas fa-money-bill-wave", title: "Earn Extra Income" }, 
          { icon: "fas fa-shield-alt", title: "Host with Confidence" },
          { icon: "fas fa-hand-holding-heart", title: "Welcome Guests" }]
          .map((feature, index) => (
            <div key={index} className="feature-card">
              <FontAwesomeIcon icon={feature.icon.split(" ")} />
              <h3>{feature.title}</h3>
              <p>{feature.title === "Earn Extra Income" ? 
                "Turn your extra space into extra income and pursue what you love." :
                feature.title === "Host with Confidence" ?
                  "We've got your back with liability insurance and property damage protection." :
                  "Meet interesting people from around the world and create lasting connections."}</p>
            </div>
          ))}
      </div>
      <HostRegistrationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      {isModalOpen && (
        <form onSubmit={handleSubmit} className="listing-form">
          <input type="text" name="title" placeholder="Title" value={newListing.title} onChange={handleInputChange} required />
          <input type="text" name="location" placeholder="Location" value={newListing.location} onChange={handleInputChange} required />
          <input type="number" name="price" placeholder="Price" value={newListing.price} onChange={handleInputChange} required />
          <input type="text" name="photo" placeholder="Photo URL" value={newListing.photo} onChange={handleInputChange} required />
          <textarea name="description" placeholder="Description" value={newListing.description} onChange={handleInputChange} required />
          <button type="submit" className="cta-button">Add Listing</button>
        </form>
      )}
    </>
  );
};

export default BecomeHost;