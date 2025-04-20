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
        <div 
          className="listing-card"
          data-aos="fade-up"
          data-aos-duration="600"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="listing-image">
            <img  src={listing.mainPhoto || listing.photo} alt={listing.title} className="listing-image" />
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
              <div style={{backgroundColor: "white", color: "black",borderRadius: "20px",padding: "5px",fontSize: "15px"}} className="rating">
                <p style={{color: "black"}} className="fas fa-star"></p>4.05 {listing.rating}
              </div>
            </div>
            <p className="listing-details">{listing.location}</p>
            <p className="listing-dates">date{listing.dates}</p>
            <p style={{color: "black", fontSize: "16px"}} className="listing-price"><strong>${listing.price}</strong> night</p>
            <p className="listing-description">{listing.description}</p>
          </div>
        </div>
      </Link>
      <style jsx>{`
        .listing-card {
          transition: all 0.3s ease;
        }

        .listing-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
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
    photo: PropTypes.string,
  }).isRequired,
};

export default ListingCard;