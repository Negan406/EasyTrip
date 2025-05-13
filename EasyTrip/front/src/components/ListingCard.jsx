import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faTag, faStar as fasStar } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faRegularHeart, faStar as farStar } from "@fortawesome/free-regular-svg-icons";
import PropTypes from 'prop-types';
import { Link, useNavigate } from "react-router-dom";
import Notification from './Notification';
import axios from 'axios';

const ListingCard = ({ listing, onRemoveFromWishlist, isInWishlist = false }) => {
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
        
        setNotification({ 
          message: 'Added to wishlist!', 
          type: 'success'
        });
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
          setNotification({ 
            message: 'Removed from wishlist.', 
            type: 'info' 
          });
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
      setNotification({ 
        message: error.message === 'Wishlist ID not found' 
          ? 'Error: Please try refreshing the page'
          : 'Failed to update wishlist. Please try again.', 
        type: 'error' 
      });
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

  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5

    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<FontAwesomeIcon key={i} icon={fasStar} className="star filled" />);
      } else if (i - 0.5 === roundedRating) {
        stars.push(<FontAwesomeIcon key={i} icon={fasStar} className="star half-filled" />);
      } else {
        stars.push(<FontAwesomeIcon key={i} icon={farStar} className="star" />);
      }
    }
    return stars;
  };

  return (
    <>
      {notification && (
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
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '12px 12px 0 0',
              backgroundColor: '#f5f5f5'
            }}
          />
          <div className="image-overlay"></div>
            <button 
            className={`favorite ${isFavorite ? 'active' : ''} ${isProcessing ? 'processing' : ''}`}
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
          <div className="rating-container">
            <div className="rating-display">
              <FontAwesomeIcon icon={fasStar} className="rating-icon" />
              <span className="rating-number">{listing.rating > 0 ? parseFloat(listing.rating).toFixed(1) : 'New'}</span>
            </div>
            <div className="stars">
              {renderStars(listing.rating || 0)}
            </div>
            <span className="rating-text">
              {listing.total_ratings > 0 ? (
                <span className="rating-count">({listing.total_ratings} {listing.total_ratings === 1 ? 'review' : 'reviews'})</span>
              ) : (
                <span className="no-ratings">No reviews yet</span>
              )}
            </span>
          </div>
          </div>
          <div className="listing-info">
            <div className="listing-title">
              <h3>{listing.title}</h3>
            </div>
            <p className="listing-details">{listing.location}</p>
          <p className="listing-price">
            <strong>${listing.price}</strong> <span className="per-night">night</span>
          </p>
            <p className="listing-description">{listing.description}</p>
        </div>
      </Link>
      <style>{`
        .listing-card {
          position: relative;
          text-decoration: none;
          color: inherit;
          display: block;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px, 
                      rgba(0, 0, 0, 0.05) 0px 1px 3px;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          height: 100%;
          margin-bottom: 20px;
        
        }

        .listing-card:hover {
          transform: translateY(-6px);
          box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px,
                      rgba(0, 0, 0, 0.06) 0px 0px 0px 1px,
                      rgba(0, 0, 0, 0.07) 0px 20px 30px -10px;
        }

        .listing-image {
          position: relative;
          width: 100%;
          height: 240px;
          overflow: hidden;
          background-color: #f5f5f5;
          border-radius: 12px 12px 0 0;
        }

        .listing-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
          background-color: #f5f5f5;
        }

        .listing-image img.loading {
          filter: blur(10px);
          transform: scale(1.1);
        }

        .listing-image .placeholder {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f5f5f5;
          color: #666;
          font-size: 0.9rem;
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.1) 0%,
            rgba(0,0,0,0) 30%,
            rgba(0,0,0,0) 60%,
            rgba(0,0,0,0.1) 100%
          );
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .listing-card:hover .image-overlay {
          opacity: 1;
        }

        .listing-card:hover .listing-image img {
          transform: scale(1.05);
        }

        .favorite {
          position: absolute;
          top: 15px;
          right: 15px;
          background: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px,
                      rgba(0, 0, 0, 0.1) 0px 1px 3px;
          z-index: 2;
          color: #222;
        }

        .favorite.active {
          background: #ff385c;
          color: white;
          transform: scale(1.1);
        }

        .favorite:hover:not(.processing) {
          transform: scale(1.15);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .category-tag {
          position: absolute;
          bottom: 15px;
          left: 15px;
          background: rgba(255, 255, 255, 0.95);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          color: #484848;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px,
                      rgba(0, 0, 0, 0.1) 0px 1px 3px;
          z-index: 2;
          backdrop-filter: blur(4px);
        }

        .listing-info {
          padding: 20px;
          background: white;
        }

        .listing-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .listing-title h3 {
          margin: 0;
          font-size: 1.3rem;
          color: #222;
          font-weight: 600;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }

        .listing-details {
          margin: 10px 0;
          color: #717171;
          font-size: 1rem;
        }

        .listing-price {
          margin: 12px 0;
          font-size: 1.2rem;
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .listing-price strong {
          color: #222;
          font-weight: 600;
        }

        .per-night {
          color: #717171;
          font-size: 1rem;
        }

        .listing-description {
          color: #717171;
          margin: 10px 0 0;
          font-size: 0.95rem;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .rating-container {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 8px 0;
          flex-wrap: wrap;
        }

        .rating-display {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #2c3e50;
          padding: 4px 8px;
          border-radius: 6px;
          color: white;
        }

        .rating-icon {
          color: #ffd700;
          font-size: 1rem;
        }

        .rating-number {
          font-weight: 600;
          font-size: 1rem;
        }

        .stars {
          display: flex;
          gap: 2px;
        }

        .star {
          color: #ddd;
          font-size: 1rem;
          transition: color 0.2s ease;
        }

        .star.filled {
          color: #ffd700;
        }

        .star.half-filled {
          position: relative;
          color: #ffd700;
          opacity: 0.5;
        }

        .rating-text {
          color: #666;
          font-size: 0.9rem;
        }

        .rating-count {
          color: #666;
        }

        .no-ratings {
          color: #999;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .listing-card {
            margin-bottom: 15px;
          }

          .listing-image {
            height: 200px;
          }

          .listing-info {
            padding: 15px;
          }

          .listing-title h3 {
            font-size: 1.2rem;
          }

          .listing-price {
            font-size: 1.1rem;
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
  isInWishlist: PropTypes.bool
};

export default ListingCard;