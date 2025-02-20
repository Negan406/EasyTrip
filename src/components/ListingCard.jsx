import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faRegularHeart } from "@fortawesome/free-regular-svg-icons";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";

const ListingCard = ({ listing }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Link to={`/listing/${listing.id}`} className="listing-card">
      <div className="listing-image">
        <img src={listing.photo} alt={listing.title} />
        <button 
          className="favorite" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
        >
          <FontAwesomeIcon icon={isFavorite ? faHeart : faRegularHeart} />
        </button>
      </div>
      <div className="listing-info">
        <div className="listing-title">
          <h3>{listing.title}</h3>
          <div className="rating">
            <i className="fas fa-star"></i> {listing.rating}
          </div>
        </div>
        <p className="listing-details">{listing.location}</p>
        <p className="listing-dates">{listing.dates}</p>
        <p className="listing-price"><strong>${listing.price}</strong> night</p>
        <p className="listing-description">{listing.description}</p>
      </div>
    </Link>
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