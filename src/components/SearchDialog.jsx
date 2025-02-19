import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import PropTypes from 'prop-types';

const SearchDialog = ({ isOpen, onClose, onSearch }) => {
  const [location, setLocation] = useState("");
  const [dates, setDates] = useState("");
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    if (!isOpen) {
      setLocation("");
      setDates("");
      setGuests(1);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ location, dates, guests });
    onClose();
  };

  return (
    <dialog open={isOpen} className="search-dialog">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="dialog-header">
          <h3>Search</h3>
          <button onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <input
          type="text"
          placeholder="Where are you going?"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <input
          type="date"
          value={dates}
          onChange={(e) => setDates(e.target.value)}
          required
        />
        <div className="guests-input">
          <label>Guests</label>
          <input
            type="number"
            min="1"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            required
          />
        </div>
        <button type="submit" className="cta-button">Search</button>
      </form>
    </dialog>
  );
};

SearchDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default SearchDialog;