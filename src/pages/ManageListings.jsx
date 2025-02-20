import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const ManageListings = () => {
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedListings = JSON.parse(localStorage.getItem('listings')) || [];
    setListings(storedListings);
  }, []);

  const handleDelete = (index) => {
    const updatedListings = listings.filter((_, i) => i !== index);
    setListings(updatedListings);
    localStorage.setItem('listings', JSON.stringify(updatedListings));
  };

  const handleModify = (id) => {
    navigate(`/edit-listing/${id}`);
  };

  return (
    <>
    <br />
    <div className="manage-listings-container">
      <h1>Manage Your Listings</h1>
      <ul className="listings-list">
        {listings.map((listing, index) => (
          <li key={index} className="listing-item">
            <img src={listing.photo} alt={listing.title} className="listing-imagee" />
            <div className="listing-details">
              <span className="listing-title">{listing.title}</span>
              <div className="listing-actions">
                <button onClick={() => handleModify(listing.id)}>Modify</button>
                <button onClick={() => handleDelete(index)}>Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
    </>
  );
};

export default ManageListings; 