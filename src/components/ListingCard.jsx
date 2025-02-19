import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faRegularHeart } from "@fortawesome/free-regular-svg-icons";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { storeData } from "../store";

const ListingCard = ({ listing }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const imageUrl = storeData.imgUrls[listing.id % storeData.imgUrls.length];

  return (
    <Link to={`/listing/${listing.id}`} className="listing-card">
      <div className="listing-image">
        <img src={imageUrl} alt={listing.title} />
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
        <p className="listing-details">{listing.distance} miles away</p>
        <p className="listing-dates">{listing.dates}</p>
        <p className="listing-price"><strong>${listing.price}</strong> night</p>
      </div>
    </Link>
  );
};

ListingCard.propTypes = {
  listing: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    category: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    distance: PropTypes.number.isRequired,
    dates: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
};

export default ListingCard;