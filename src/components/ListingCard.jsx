import React from 'react';
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faRegularHeart } from "@fortawesome/free-regular-svg-icons";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import Notification from './Notification';

const ListingCard = ({ listing }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const isInWishlist = wishlist.some(item => item.id === listing.id);
    setIsFavorite(isInWishlist);
  }, [listing.id]);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      setNotification({ message: 'Please log in to add items to your wishlist.', type: 'info' });
      return;
    }

    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (!isFavorite) {
      wishlist.push({
        id: listing.id,
        title: listing.title,
        location: listing.location,
        price: listing.price,
        photo: listing.photo
      });
      setNotification({ message: 'Added to wishlist!', type: 'success' });
    } else {
      const index = wishlist.findIndex(item => item.id === listing.id);
      if (index !== -1) wishlist.splice(index, 1);
      setNotification({ message: 'Removed from wishlist.', type: 'info' });
    }

    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      setIsFavorite(!isFavorite);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        alert('Storage limit exceeded. Please clear some data.');
      } else {
        console.error('Failed to update wishlist:', error);
      }
    }
  };

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <Link to={`/listing/${listing.id}`} className="listing-card">
        <div className="listing-image">
          <img  src={listing.photo} alt={listing.title} className="listing-image" />
          <button 
            className="favorite" 
            onClick={handleFavoriteClick}
          >
            <FontAwesomeIcon icon={isFavorite ? faHeart : faRegularHeart} />
          </button>
        </div>
        <div className="listing-info">
          <div className="listing-title">
            <h3>{listing.title}</h3>
            <div style={{backgroundColor: "blue", color: "white",borderRadius: "20px",padding: "5px",fontSize: "13px"}} className="rating">
              <i style={{color: "yellow"}} className="fas fa-star"></i>4.05 {listing.rating}
            </div>
          </div>
          <p className="listing-details">{listing.location}</p>
          <p className="listing-dates">date{listing.dates}</p>
          <p style={{color: "blue", fontSize: "16px"}} className="listing-price"><strong>${listing.price}</strong> night</p>
          <p className="listing-description">{listing.description}</p>
        </div>
      </Link>
    </>
  );
};

ListingCard.propTypes = {
  listing: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    photo: PropTypes.string.isRequired,
  }).isRequired,
};

export default ListingCard;