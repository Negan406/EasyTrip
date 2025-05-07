import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/Sidebar";
import ListingCard from "../components/ListingCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchWishlistItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:8000/api/wishlists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (Array.isArray(response.data)) {
        setWishlistItems(response.data);
        setError(null);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      if (error.response?.status === 401) {
        setError('Please log in to view your wishlist');
        navigate('/login');
      } else {
        setError('Failed to load your wishlist. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistItems();
  }, [navigate]);

  const handleRemoveFromWishlist = async (listingId) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:8000/api/wishlists/${listingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setWishlistItems(prev => prev.filter(item => item.id !== listingId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setError('Failed to remove item from wishlist. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <Sidebar />
      <main className="wishlist-container">
        <div className="wishlist-header">
          <Link to="/" className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to listings
          </Link>
          <h1><FontAwesomeIcon icon={faHeart} /> My Wishlist</h1>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="wishlist-grid">
          {wishlistItems.length > 0 ? (
            wishlistItems.map((listing) => (
              <div 
                key={listing.id} 
                className="wishlist-item"
                data-aos="fade-up"
              >
                <ListingCard 
                  listing={listing} 
                  onRemoveFromWishlist={() => handleRemoveFromWishlist(listing.id)}
                  isInWishlist={true}
                />
              </div>
            ))
          ) : (
            <div className="empty-wishlist" data-aos="fade-up">
              <FontAwesomeIcon icon={faHeart} className="empty-icon" />
              <h2>Your wishlist is empty</h2>
              <p>Save your favorite places by clicking the heart icon on any listing</p>
              <Link to="/" className="browse-button">
                Browse Listings
              </Link>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .wishlist-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
        }

        .wishlist-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .back-button:hover {
          color: #333;
        }

        .wishlist-header h1 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
          color: #333;
        }

        .wishlist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          padding: 1rem 0;
        }

        .wishlist-item {
          transition: transform 0.3s ease;
        }

        .wishlist-item:hover {
          transform: translateY(-5px);
        }

        .empty-wishlist {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 2rem;
          background: #f8f9fa;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .empty-icon {
          font-size: 3rem;
          color: #dc3545;
          margin-bottom: 1rem;
        }

        .empty-wishlist h2 {
          margin: 1rem 0;
          color: #333;
        }

        .empty-wishlist p {
          color: #666;
          margin-bottom: 2rem;
        }

        .browse-button {
          display: inline-block;
          padding: 0.8rem 1.5rem;
          background: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .browse-button:hover {
          background: #0056b3;
          transform: translateY(-2px);
        }

        .error-message {
          padding: 1rem;
          margin-bottom: 2rem;
          background: #f8d7da;
          color: #721c24;
          border-radius: 8px;
          text-align: center;
        }

        @media (max-width: 768px) {
          .wishlist-page {
            padding: 1rem;
          }

          .wishlist-grid {
            grid-template-columns: 1fr;
          }

          .wishlist-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Wishlist;