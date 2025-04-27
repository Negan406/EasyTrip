import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LoadingSpinner from "../components/LoadingSpinner";
import Notification from "../components/Notification";

const ListingDetails = () => {
  const [listing, setListing] = useState(null);
  const { id } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAlreadyBooked, setIsAlreadyBooked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = () => {
      const listings = JSON.parse(localStorage.getItem('listings')) || [];
      const data = listings.find(listing => listing.id === parseInt(id));
      if (data) {
        setListing(data);
      } else {
        console.error('Listing not found');
      }
      setLoading(false);
    };
    fetchListing();

    // Check if the listing is already booked
    const trips = JSON.parse(localStorage.getItem('trips')) || [];
    const isBooked = trips.some(trip => trip.listing.id === parseInt(id));
    setIsAlreadyBooked(isBooked);
  }, [id]);

  const clearSpecificItem = (key) => {
    localStorage.removeItem(key);
    alert(`${key} data cleared!`);
  };

  const handleBookNow = (e) => {
    e.preventDefault();
    if (isAlreadyBooked) {
      setNotification({ message: 'This listing is already booked by you.', type: 'error' });
      return;
    }

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      setNotification({ message: 'Please log in to book this listing.', type: 'error' });
      return;
    }

    // Navigate to the Payment page with listing details
    navigate('/payment', { state: { listing, startDate, endDate } });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  if (loading) return <LoadingSpinner />;

  if (!listing) return <div>Loading...</div>;

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      <main className="listing-details-page">
        <div className="listing-gallery">
          <div className="main-image">
            <img src={listing.mainPhoto || listing.photo} alt={listing.title} />
            <button className="favorite-large">
              <FontAwesomeIcon icon={["far", "heart"]} />
            </button>
          </div>
          <div className="additional-images">
            {listing.additionalPhotos && listing.additionalPhotos.slice(0, 3).map((photo, index) => (
              <div key={index} className="additional-image">
                <img src={photo} alt={`${listing.title} - ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
        <div className="listing-content">
          <div className="listing-info-container">
            <div className="listing-header">
              <h1>{listing.title}</h1>
              <div className="listing-meta">
                <div className="rating-large">
                  <i className="fas fa-star"></i>4.5 {listing.rating}
                </div>
                <div className="location">
                  <i className="fas fa-map-marker-alt"></i>  {listing.location}
                </div>
              </div>
            </div>
            {listing.host && (
              <div className="host-info">
                <img src={listing.host.avatar} alt={listing.host.name} className="host-avatar" />
                <div className="host-details">
                  <h3>Hosted by {listing.host.name}</h3>
                  <p>Superhost · Hosting since 2019</p>
                </div>
              </div>
            )}
            <div className="listing-description">
              <p>{listing.description}</p>
            </div>
            {listing.amenities && (
              <div className="amenities">
                <h2>What this place offers</h2>
                <div className="amenities-grid">
                  {listing.amenities.map((amenity, index) => (
                    <div key={index} className="amenity-item">
                      <FontAwesomeIcon icon={amenity.icon.split(" ")} />
                      <span>{amenity.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="booking-card">
            <div className="booking-price">
              <h2>$ {listing.price} <span className="per-night">night</span></h2>
            </div>
            <form className="booking-form" onSubmit={handleBookNow}>
              <div className="date-inputs">
                <input type="date" placeholder="Check-in" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                <input type="date" placeholder="Check-out" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
              <input type="number" min="1" max="16" placeholder="Guests" required />
              <button type="submit" className="book-button" disabled={isAlreadyBooked}>Book now</button>
            </form>
          </div>
        </div>

        <style jsx>{`
          .listing-gallery {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .main-image {
            position: relative;
            width: 100%;
            height: 400px;
            border-radius: 12px;
            overflow: hidden;
          }

          .main-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .additional-images {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            height: 200px;
          }

          .additional-image {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            cursor: pointer;
          }

          .additional-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }

          .additional-image:hover img {
            transform: scale(1.05);
          }

          .favorite-large {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: white;
            border: none;
            border-radius: 50%;
            padding: 0.5rem;
            cursor: pointer;
            transition: transform 0.2s ease;
            z-index: 1;
          }

          .favorite-large:hover {
            transform: scale(1.1);
          }

          @media (max-width: 768px) {
            .main-image {
              height: 300px;
            }

            .additional-images {
              height: 150px;
            }
          }
        `}</style>
      </main>
    </>
  );
};

export default ListingDetails;