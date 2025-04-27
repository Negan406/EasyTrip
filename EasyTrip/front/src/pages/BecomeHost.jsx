import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import HostRegistrationModal from "../components/HostRegistrationModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from 'react-router-dom';
import Notification from "../components/Notification";
import AOS from 'aos';
import 'aos/dist/aos.css';
import im1 from "../pages/announce-advertisement-poster-background-illustration-free-vector.jpg";
import im2 from "../pages/th.jpeg";
import im3 from "../pages/ge.png";
import im4 from "../pages/tr.webp";


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
  const role = localStorage.getItem('role');

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

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
      setNotification({ 
        message: 'Please login first to become a host', 
        type: 'info' 
      });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
    <div className="become-host-page">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Original Host Header with Buttons */}
      <section className="host-header">
        <h1>Become a Host</h1>
        <p>Publier votre logement sur EasyTrip, c'est facile</p>
        <div className="header-buttons" data-aos="fade-up">
          <button 
            className="cta-button" 
            onClick={handleGetStarted}
            style={{backgroundColor: 'black', color: 'white', position: 'relative', right: '10px'}}
          >
            Get Started 
          </button>
          
          {isLoggedIn && (
            <button 
              className="cta-button"
              onClick={handleManageListings}
              style={{backgroundColor: 'rgb(11, 226, 11)', color: 'white'}}
            >
              Manage Listings
            </button>
          )}
          
          {isLoggedIn && (
            <button 
              className="cta-button"
              onClick={handleManageBookings}
              style={{backgroundColor: 'rgb(11, 226, 11)', color: 'white', position: 'relative', left: '10px'}}
            >
              Manage Bookings
            </button>
          )}
          
          {role === 'admin' && (
            <button 
              className="cta-button"
              onClick={() => navigate('/pending-listings')}
              style={{marginLeft: '20px'}}
            >
              Review Pending Listings
            </button>
          )}
        </div>
      </section>

      {/* New Feature Sections */}
      <section className="hero-section">
        <div className="hero-content" data-aos="fade-up">
          <h1>Tous les outils qu'il vous faut en une même application</h1>
          <p>Nous protégeons votre logement, quel que soit votre style d'accueil</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="feature-card" data-aos="fade-right">
          <img src={im1} alt="Configuration" />
          <div className="feature-content">
            <h2>Configuration de votre annonce</h2>
            <p>Photographies de votre logement, configuration des tarifs et création d'un guide d'arrivée</p>
          </div>
        </div>

        <div className="feature-card" data-aos="fade-left">
          <img src={im2} alt="Préparation" />
          <div className="feature-content">
            <h2>Préparation de votre logement</h2>
            <p>Préparation, ménage et service de maintenance pour votre logement</p>
          </div>
        </div>

        <div className="feature-card" data-aos="fade-right">
          <img src={im3} alt="Réservations" />
          <div className="feature-content">
            <h2>Gestion de vos réservations</h2>
            <p>Gestion de vos réservations et communication avec les voyageurs</p>
          </div>
        </div>

        <div className="feature-card" data-aos="fade-left">
          <img src={im4} alt="Accompagnement" />
          <div className="feature-content">
            <h2>Accompagnement des voyageurs</h2>
            <p>Gestion des arrivées, des départs et des demandes sur place</p>
          </div>
        </div>
      </section>

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

      <style jsx>{`
        .header-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .host-header {
          margin-bottom: 0;
          padding-bottom: 4rem;
        }

        .hero-section {
          margin-top: 0;
        }

        .become-host-page {
          overflow-x: hidden;
        }

        .hero-section {
          background: linear-gradient(rgba(0,0,0,0.5),black), 
                      url('/images/hero-bg.jpg');
          background-size: cover;
          background-position: center;
          height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
          padding: 2rem;
        }

        .hero-content {
          max-width: 800px;
        }

        .hero-content h1 {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          font-weight: bold;
        }

        .hero-content p {
          font-size: 1.5rem;
          margin-bottom: 2rem;
        }

        .features-section {
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
          
        }

        .feature-card {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 4rem;
          padding: 2rem;
          border-radius: 12px;
          background: linear-gradient(rgba(0,0,0,0.1),white );
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          
        }

        .feature-card:nth-child(even) {
          flex-direction: row-reverse;
        }

        .feature-card img {
          width: 400px;
          height: 300px;
          object-fit: cover;
          border-radius: 8px;
        }

        .feature-content {
          flex: 1;
        }

        .feature-content h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: black;
        }

        .feature-content p {
          font-size: 1.1rem;
          color: black;
          line-height: 1.6;
        }
       

        @media (max-width: 768px) {
          .feature-card {
            flex-direction: column !important;
          }

          .feature-card img {
            width: 100%;
            height: 200px;
          }

          .hero-content h1 {
            font-size: 2rem;
          }
         
        }
      `}</style>
    </div>
  );
};

export default BecomeHost;