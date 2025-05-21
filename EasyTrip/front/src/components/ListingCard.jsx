import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faTag, faStar as fasStar, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faRegularHeart } from "@fortawesome/free-regular-svg-icons";
import PropTypes from 'prop-types';
import { Link, useNavigate } from "react-router-dom";
import Notification from './Notification';
import axios from 'axios';

const ListingCard = ({ listing, onRemoveFromWishlist, isInWishlist = false, onWishlistUpdate }) => {
  const [isFavorite, setIsFavorite] = useState(isInWishlist);
  const [notification, setNotification] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkWishlistStatus = async () => {
      const token = localStorage.getItem('authToken');
      if (token && !isInWishlist) {
        try {
          const response = await axios.get(`http://localhost:8000/api/wishlists/check/${listing.id}`);
          setIsFavorite(response.data.is_wishlisted);
          if (response.data.wishlist_id) {
            listing.wishlist_id = response.data.wishlist_id;
          }
        } catch (error) {
          console.error('Error checking wishlist status:', error);
        }
      }
    };

    checkWishlistStatus();
  }, [listing.id, isInWishlist]);

  useEffect(() => {
    setIsFavorite(isInWishlist);
  }, [isInWishlist]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessing) return;

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      setNotification({ 
        message: 'Please log in to add items to your wishlist.', 
        type: 'info',
        action: () => navigate('/login')
      });
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('authToken');
    if (!isFavorite) {
        // Add to wishlist
        const response = await axios.post('http://localhost:8000/api/wishlists', {
          listing_id: listing.id
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data && response.data.wishlist_id) {
          listing.wishlist_id = response.data.wishlist_id;
        }
        
        const message = 'Added to wishlist!';
        const type = 'success';
        
        // Use the passed callback if available
        if (onWishlistUpdate) {
          onWishlistUpdate(message, type);
        } else {
          setNotification({ 
            message, 
            type
          });
        }
        
        setIsFavorite(true);
    } else {
        // Remove from wishlist
        const wishlistId = listing.wishlist_id;
        if (!wishlistId) {
          throw new Error('Wishlist ID not found');
        }
        
        const response = await axios.delete(`http://localhost:8000/api/wishlists/${wishlistId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 200) {
          const message = 'Removed from wishlist.';
          const type = 'info';
          
          // Use the passed callback if available
          if (onWishlistUpdate) {
            onWishlistUpdate(message, type);
          } else {
            setNotification({ 
              message,
              type
            });
          }
          
          setIsFavorite(false);
          listing.wishlist_id = null;
          
          if (onRemoveFromWishlist) {
            onRemoveFromWishlist();
          }
        } else {
          throw new Error('Failed to remove from wishlist');
        }
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
      const message = error.message === 'Wishlist ID not found' 
        ? 'Error: Please try refreshing the page'
        : 'Failed to update wishlist. Please try again.';
      const type = 'error';
      
      // Use the passed callback if available
      if (onWishlistUpdate) {
        onWishlistUpdate(message, type);
      } else {
        setNotification({ 
          message,
          type
        });
      }
      
      // Reset the favorite state if there was an error
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await axios.get(`http://localhost:8000/api/wishlists/check/${listing.id}`);
          setIsFavorite(response.data.is_wishlisted);
        } catch (checkError) {
          console.error('Error checking wishlist status:', checkError);
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCategory = (category) => {
    return category
      ?.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || 'Uncategorized';
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/400x300?text=No+Image+Available';
    
    // If it's already a full URL
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // For storage/listings paths
    if (imageUrl.includes('storage/listings/') || imageUrl.startsWith('listings/')) {
      const cleanPath = imageUrl
        .replace('storage/', '')  // Remove 'storage/' if present
        .replace(/^\/+/, '');     // Remove leading slashes
      return `http://localhost:8000/storage/${cleanPath}`;
    }
    
    // For direct storage paths
    if (imageUrl.startsWith('storage/')) {
      return `http://localhost:8000/${imageUrl}`;
    }
    
    // For any other case, assume it's a relative path in storage
    const cleanPath = imageUrl.replace(/^\/+/, '');
    return `http://localhost:8000/storage/${cleanPath}`;
  };

  return (
    <>
      {notification && !onWishlistUpdate && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          action={notification.action}
        />
      )}
      <Link to={`/listing/${listing.id}`} className="listing-card">
        <div className="listing-image">
          <img 
            src={getImageUrl(listing.main_photo || listing.mainPhoto)}
            alt={listing.title} 
            onError={(e) => {
              console.error('Image failed to load:', {
                original: listing.main_photo || listing.mainPhoto,
                attempted: e.target.src
              });
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image+Available';
            }}
            loading="lazy"
          />
          <div className="image-overlay"></div>
          <button 
            className={`favorite-btn ${isFavorite ? 'active' : ''} ${isProcessing ? 'processing' : ''}`}
            onClick={handleFavoriteClick}
            disabled={isProcessing}
            title={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <FontAwesomeIcon 
              icon={isFavorite ? faHeart : faRegularHeart}
              className={isProcessing ? 'fa-beat' : ''}
            />
          </button>
          {listing.category && (
            <div className="category-tag">
              <FontAwesomeIcon icon={faTag} />
              <span>{formatCategory(listing.category)}</span>
            </div>
          )}
        </div>
        
        <div className="listing-info">
          <div className="listing-header">
            <h3 className="listing-title">{listing.title}</h3>
            <div className="rating-display">
              <FontAwesomeIcon icon={fasStar} />
              {listing.total_ratings > 0 ? (
                <>
                  <span>{parseFloat(listing.rating).toFixed(1)}</span>
                  <span className="total-ratings">({listing.total_ratings} {listing.total_ratings === 1 ? 'review' : 'reviews'})</span>
                </>
              ) : (
                <span>new</span>
              )}
            </div>
          </div>
          
          <div className="listing-location">
            <FontAwesomeIcon icon={faLocationDot} className="location-icon" />
            <span>{listing.location}</span>
          </div>
          
          <div className="listing-price">
            <strong>${listing.price}</strong><span>/night</span>
          </div>
        </div>
      </Link>
      
      <style>{`
        .listing-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          text-decoration: none;
          color: inherit;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .listing-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
        }

        .listing-image {
          position: relative;
          width: 100%;
          height: 220px;
          overflow: hidden;
        }

        .listing-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .listing-card:hover .listing-image img {
          transform: scale(1.08);
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.1) 0%,
            rgba(0, 0, 0, 0) 40%,
            rgba(0, 0, 0, 0.1) 100%
          );
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .listing-card:hover .image-overlay {
          opacity: 1;
        }

        .favorite-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: transparent;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 2;
          font-size: 1.3rem;
          color: white;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.4);
        }

        .favorite-btn.active {
          color: #ff385c;
          transform: scale(1.1);
        }

        .favorite-btn:hover:not(.processing) {
          transform: scale(1.15);
        }

        .favorite-btn.active:hover:not(.processing) {
          color: #e31c5f;
        }

        .category-tag {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(255, 255, 255, 0.9);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          color: #333;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          z-index: 2;
          backdrop-filter: blur(4px);
        }

        .listing-info {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 8px;
        }

        .listing-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .listing-title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }

        .rating-display {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #f8f9fa;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
          white-space: nowrap;
        }

        .rating-display svg {
          color: #ffa500;
          margin-right: 2px;
        }
        
        .total-ratings {
          font-weight: normal;
          color: #666;
          font-size: 0.85rem;
          margin-left: 2px;
        }

        .listing-location {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #555;
          font-size: 0.95rem;
          margin-bottom: 4px;
        }

        .location-icon {
          color: #ff385c;
          font-size: 0.85rem;
        }

        .listing-price {
          margin-top: auto;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .listing-price strong {
          color: #333;
          font-weight: 600;
        }

        .listing-price span {
          color: #666;
          font-size: 0.9rem;
        }

        .star {
          color: #ddd;
          font-size: 0.9rem;
        }

        .star.filled {
          color: #ffa500;
        }

        .star.half-filled {
          position: relative;
          color: #ffa500;
          opacity: 0.5;
        }

        @media (max-width: 1024px) {
          .listing-image {
            height: 200px;
          }
          
          .listing-info {
            padding: 14px;
          }
          
          .listing-title {
            font-size: 1rem;
          }
          
          .rating-display {
            padding: 3px 6px;
            font-size: 0.85rem;
          }
          
          .total-ratings {
            font-size: 0.8rem;
          }
        }
        
        @media (max-width: 768px) {
          .listing-image {
            height: 180px;
          }
          
          .listing-info {
            padding: 12px;
          }
          
          .category-tag {
            font-size: 0.75rem;
            padding: 4px 10px;
          }
          
          .favorite-btn {
            width: 32px;
            height: 32px;
            font-size: 1.1rem;
          }
          
          .listing-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .rating-display {
            margin-top: 4px;
          }
        }
        
        @media (max-width: 480px) {
          .listing-image {
            height: 220px;
          }
        }
      `}</style>
    </>
  );
};

ListingCard.propTypes = {
  listing: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    mainPhoto: PropTypes.string,
    main_photo: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    wishlist_id: PropTypes.number,
    rating: PropTypes.number,
    total_ratings: PropTypes.number
  }).isRequired,
  onRemoveFromWishlist: PropTypes.func,
  isInWishlist: PropTypes.bool,
  onWishlistUpdate: PropTypes.func
};

export default ListingCard;