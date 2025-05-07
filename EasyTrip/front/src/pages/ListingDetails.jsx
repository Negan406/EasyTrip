import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Comments from "../components/Comments";
import LoadingSpinner from "../components/LoadingSpinner";
import Notification from "../components/Notification";
import axios from "axios";

const ListingDetails = () => {
  const [listing, setListing] = useState(null);
  const { id } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAlreadyBooked, setIsAlreadyBooked] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const navigate = useNavigate();

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/800x600?text=No+Image+Available';
    
    // If it's already a full URL
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // For storage paths
    if (imageUrl.includes('storage/') || imageUrl.startsWith('profiles/') || imageUrl.startsWith('listings/')) {
      const cleanPath = imageUrl
        .replace('storage/', '')  // Remove 'storage/' if present
        .replace(/^\/+/, '');     // Remove leading slashes
      return `http://localhost:8000/storage/${cleanPath}`;
    }
    
    // For any other case, assume it's a relative path in storage
    const cleanPath = imageUrl.replace(/^\/+/, '');
    return `http://localhost:8000/storage/${cleanPath}`;
  };

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/api/listings/${id}`);
        console.log('API Response:', response.data); // Debug log
        
        if (response.data && response.data.listing) {
          const listingData = response.data.listing;
          
          // Format the listing data
          const formattedListing = {
            id: listingData.id,
            title: listingData.title,
            description: listingData.description,
            location: listingData.location,
            price: parseFloat(listingData.price),
            mainPhoto: listingData.main_photo,
            photos: listingData.photos?.map(photo => photo.photo_url) || [],
            category: listingData.category,
            host: listingData.host,
            status: listingData.status
          };
          
          setListing(formattedListing);
          // Set the main photo as the initially selected photo
          setSelectedPhoto(getImageUrl(listingData.main_photo));
        } else {
          console.error("Invalid response format:", response.data);
          setNotification({
            message: 'Error: Listing not found',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
        setNotification({
          message: 'Error loading listing details. Please try again later.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListing();

    // Check if the listing is already booked
    const checkBookingStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/bookings/check/${id}`);
        setIsAlreadyBooked(response.data.isBooked);
      } catch (error) {
        console.error('Error checking booking status:', error);
      }
    };

    if (localStorage.getItem('isLoggedIn') === 'true') {
      checkBookingStatus();
    }
  }, [id]);

  const handleBookNow = async (e) => {
    e.preventDefault();
    
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      setNotification({ message: 'Please log in to book this listing.', type: 'error' });
      return;
    }

    if (isAlreadyBooked) {
      setNotification({ message: 'This listing is already booked by you.', type: 'error' });
      return;
    }

    navigate('/payment', { 
      state: { 
        listing,
        booking: {
          startDate,
          endDate
        }
      } 
    });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  if (loading) return <LoadingSpinner />;
  if (!listing) return <div>Listing not found</div>;

  // Create array of unique photos with proper URLs
  const allPhotos = Array.from(new Set([
    getImageUrl(listing.mainPhoto),
    ...listing.photos.map(photo => getImageUrl(photo))
  ])).filter(Boolean);

  return (
    <div className="listing-details-container">
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
            <img 
              src={selectedPhoto || getImageUrl(listing.mainPhoto)} 
              alt={listing.title}
              onError={(e) => {
                console.error('Image failed to load:', {
                  original: listing.mainPhoto,
                  attempted: e.target.src
                });
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/800x600?text=No+Image+Available';
              }}
            />
          </div>
          {allPhotos.length > 1 && (
            <div className="photo-grid">
              {allPhotos.map((photo, index) => (
                <div 
                  key={index} 
                  className={`photo-thumbnail ${selectedPhoto === photo ? 'selected' : ''}`}
                  onClick={() => handlePhotoClick(photo)}
                >
                  <img 
                    src={photo} 
                    alt={`${listing.title} - ${index + 1}`}
                    onError={(e) => {
                      console.error('Thumbnail failed to load:', {
                        photo,
                        index
                      });
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150x150?text=Image+Not+Found';
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="listing-content">
          <div className="listing-info-container">
            <div className="listing-header">
              <h1>{listing.title}</h1>
              <div className="listing-meta">
                <div className="location">
                  <i className="fas fa-map-marker-alt"></i> {listing.location}
                </div>
                <div className="category">
                  Category: {listing.category}
                </div>
              </div>
            </div>

            {listing.host && (
              <div className="host-info">
                <div className="host-photo-container">
                  <img 
                    src={getImageUrl(listing.host.profile_photo)} 
                    alt={listing.host.name} 
                    className="host-avatar"
                    onError={(e) => {
                      console.error('Host photo failed to load:', {
                        original: listing.host.profile_photo,
                        attempted: e.target.src
                      });
                      e.target.src = 'https://via.placeholder.com/150x150?text=Host';
                    }}
                  />
                </div>
                <div className="host-details">
                  <h3>Hosted by {listing.host.name}</h3>
                  {listing.host.bio && <p>{listing.host.bio}</p>}
                  {listing.host.phone && (
                    <p className="host-contact">
                      <i className="fas fa-phone"></i> {listing.host.phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="listing-description">
              <p>{listing.description}</p>
            </div>

            <div className="reviews-section">
              <Comments 
                listingId={id.toString()} 
                userName={localStorage.getItem('userName')}
                isLoggedIn={localStorage.getItem('isLoggedIn') === 'true'}
              />
            </div>
          </div>

          <div className="booking-card">
            <div className="booking-price">
              <h2>${listing.price} <span className="per-night">night</span></h2>
            </div>
            <form className="booking-form" onSubmit={handleBookNow}>
              <div className="date-inputs">
                <input 
                  type="date" 
                  placeholder="Check-in" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  required 
                />
                <input 
                  type="date" 
                  placeholder="Check-out" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  required 
                />
              </div>
              <input type="number" min="1" max="16" placeholder="Guests" required />
              <button 
                type="submit" 
                className="book-button" 
                disabled={isAlreadyBooked}
              >
                {isAlreadyBooked ? 'Already Booked' : 'Book now'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <style>{`
        .listing-details-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .listing-gallery {
          margin-bottom: 2rem;
        }

        .main-image {
          position: relative;
          width: 100%;
          height: 400px;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 1rem;
          background: #f8f9fa;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .main-image:hover img {
          transform: scale(1.02);
        }

        .photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .photo-thumbnail {
          position: relative;
          height: 100px;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f8f9fa;
        }

        .photo-thumbnail:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .photo-thumbnail.selected {
          border: 2px solid var(--primary-color, #007bff);
        }

        .photo-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .listing-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-top: 2rem;
        }

        .listing-header {
          margin-bottom: 2rem;
        }

        .listing-header h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .listing-meta {
          display: flex;
          gap: 1rem;
          color: #666;
        }

        .host-info {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          margin: 2rem 0;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .host-photo-container {
          flex-shrink: 0;
        }

        .host-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }

        .host-avatar:hover {
          transform: scale(1.05);
        }

        .host-details {
          flex: 1;
        }

        .host-details h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.3rem;
          color: #333;
        }

        .host-details p {
          margin: 0.5rem 0;
          color: #666;
          line-height: 1.5;
        }

        .host-contact {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          color: #555;
        }

        .host-contact i {
          color: #007bff;
        }

        .listing-description {
          margin: 2rem 0;
          line-height: 1.6;
        }

        .booking-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          position: sticky;
          top: 2rem;
          height: fit-content;
        }

        .booking-price {
          margin-bottom: 1.5rem;
        }

        .booking-price h2 {
          font-size: 1.5rem;
          margin: 0;
        }

        .per-night {
          font-size: 1rem;
          color: #666;
        }

        .booking-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .date-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .date-inputs input,
        .booking-form input[type="number"] {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }

        .book-button {
          background: var(--primary-color, #007bff);
          color: white;
          padding: 1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: background-color 0.3s ease;
        }

        .book-button:not(:disabled):hover {
          background: var(--primary-color-dark, #0056b3);
        }

        .book-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .listing-content {
            grid-template-columns: 1fr;
          }

          .main-image {
            height: 300px;
          }

          .photo-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }

          .booking-card {
            position: static;
            margin-top: 2rem;
          }

          .host-info {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 1rem;
          }

          .host-avatar {
            width: 80px;
            height: 80px;
            margin-bottom: 1rem;
          }

          .host-contact {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ListingDetails;