import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const ManageListings = () => {
  const [listings, setListings] = useState([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedListings = JSON.parse(localStorage.getItem('listings')) || [];
    setListings(storedListings);
  }, []);

  const handleDelete = (index) => {
    const updatedListings = listings.filter((_, i) => i !== index);
    setListings(updatedListings);
    localStorage.setItem('listings', JSON.stringify(updatedListings));
    setDeleteConfirmation(null);
    setShowSuccessMsg(true);
    setTimeout(() => setShowSuccessMsg(false), 3000);
  };

  const confirmDelete = (index) => {
    setDeleteConfirmation(index);
  };

  const handleModify = (id) => {
    navigate(`/edit-listing/${id}`);
  };

  return (
    <div className="page-container">
      <div className="content-wrap">
        <div className="container-center">
          <h1 className="page-title">Manage Your Listings</h1>
          {showSuccessMsg && (
            <div className="success-message">Listing deleted successfully!</div>
          )}
          {listings.length === 0 ? (
            <div className="no-results-message">No listings found</div>
          ) : (
            <ul className="listings-list">
              {listings.map((listing, index) => (
                <li key={index} className="listing-item">
                  <img src={listing.mainPhoto || listing.photo} alt={listing.title} className="listing-imagee" />
                  <div className="listing-details">
                    <span className="listing-title">{listing.title}</span>
                    <div className="listing-actions">
                      <button className="edit-button" onClick={() => handleModify(listing.id)}>Edit <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                              </svg></button>
                      <button 
                        style={{backgroundColor: 'red'}} 
                        onClick={() => confirmDelete(index)}
                      >
                        Delete <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                              </svg></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {deleteConfirmation !== null && (
          <div className="delete-modal">
            <div className="modal-content">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete this listing?</p>
              <div className="modal-buttons">
                <button onClick={() => setDeleteConfirmation(null)}>Cancel</button>
                <button onClick={() => handleDelete(deleteConfirmation)}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .success-message {
          background-color: #4CAF50;
          color: white;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          text-align: center;
        }
        .delete-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }
        .modal-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 20px;
        }
        .modal-buttons button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .modal-buttons button:first-child {
          background-color: #ccc;
        }
        .modal-buttons button:last-child {
          background-color: red;
          color: white;
        }
        .page-container {
          min-height: 100vh;
          position: relative;
          padding-bottom: 60px;
        }
        .content-wrap {
          padding-bottom: 2.5rem;
        }
        .no-results-message {
          text-align: center;
          margin-top: 50px;
          font-size: 1.2em;
          color: #666;
        }
        .container-center {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .page-title {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 30px;
          font-size: 2.5em;
        }
        .listings-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          padding: 0;
          list-style: none;
        }
        .listing-item {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 15px;
          transition: transform 0.2s;
        }
        .listing-item:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
};

export default ManageListings;