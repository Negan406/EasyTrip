import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from "../components/LoadingSpinner";
import Sidebar from "../components/Sidebar";

const ManageListings = () => {
  const [listings, setListings] = useState([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserListings();
  }, []);

  const fetchUserListings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:8000/api/listings/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setListings(response.data.listings);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to fetch listings'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (listingId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`http://localhost:8000/api/listings/${listingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setListings(listings.filter(listing => listing.id !== listingId));
        setNotification({
          type: 'success',
          message: 'Listing deleted successfully'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete listing'
      });
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const handleModify = (id) => {
    navigate(`/edit-listing/${id}`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="app-container">
      <Sidebar />
      <div className="page-container">
        <div className="content-wrap">
          <div className="container-center">
            <h1 className="page-title">Manage Your Listings</h1>
            
            {notification && (
              <div className={`notification ${notification.type}`}>
                {notification.message}
                <button 
                  className="close-btn" 
                  onClick={() => setNotification(null)}
                >
                  ×
                </button>
              </div>
            )}

            {listings.length === 0 ? (
              <div className="no-results-message">
                You haven&apos;t created any listings yet
              </div>
            ) : (
              <div className="listings-grid">
                {listings.map((listing) => (
                  <div key={listing.id} className="listing-card">
                    <div className="listing-image">
                      <img 
                        src={`http://localhost:8000/storage/${listing.main_photo}`}
                        alt={listing.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="listing-content">
                      <h3>{listing.title}</h3>
                      <p className="listing-location">{listing.location}</p>
                      <p className="listing-price">${listing.price} / night</p>
                      <div className="listing-status">
                        Status: <span className={`status-badge ${listing.status}`}>
                          {listing.status}
                        </span>
                      </div>
                      <div className="listing-actions">
                        <button 
                          className="edit-button"
                          onClick={() => handleModify(listing.id)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => setDeleteConfirmation(listing.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {deleteConfirmation && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to delete this listing? This action cannot be undone.</p>
                <div className="modal-buttons">
                  <button 
                    className="cancel-button"
                    onClick={() => setDeleteConfirmation(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="confirm-button"
                    onClick={() => handleDelete(deleteConfirmation)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .app-container {
          display: flex;
          min-height: 100vh;
        }

        .page-container {
          flex: 1;
          padding: 2rem;
          margin-left: 250px;
          background: #f8f9fa;
        }

        .content-wrap {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-title {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 2rem;
          font-size: 2rem;
        }

        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 1rem 2rem;
          border-radius: 8px;
          color: white;
          display: flex;
          align-items: center;
          gap: 1rem;
          z-index: 1000;
          animation: slideIn 0.3s ease;
        }

        .notification.success {
          background: #28a745;
        }

        .notification.error {
          background: #dc3545;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0;
          margin-left: 1rem;
        }

        .listings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          padding: 1rem;
        }

        .listing-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          border: 1px solid rgba(0,0,0,0.1);
          position: relative;
        }

        .listing-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }

        .listing-image {
          height: 200px;
          overflow: hidden;
        }

        .listing-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .listing-card:hover .listing-image img {
          transform: scale(1.05);
        }

        .listing-content {
          padding: 1.5rem;
        }

        .listing-content h3 {
          margin: 0 0 0.5rem 0;
          color: #2c3e50;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .listing-location {
          color: #666;
          margin: 0.5rem 0;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .listing-price {
          font-weight: 600;
          color: #2c3e50;
          margin: 0.75rem 0;
          font-size: 1.1rem;
        }

        .listing-status {
          margin: 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-badge {
          padding: 0.35rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-badge.approved {
          background: #28a745;
          color: white;
          box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2);
        }

        .status-badge.pending {
          background: #ffc107;
          color: #000;
          box-shadow: 0 2px 4px rgba(255, 193, 7, 0.2);
        }

        .status-badge.rejected {
          background: #dc3545;
          color: white;
          box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2);
        }

        .listing-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
          padding: 0 1rem;
        }

        .edit-button,
        .delete-button {
          flex: 1;
          padding: 0.75rem 1.25rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .edit-button {
          background: #007bff;
          color: white;
          border: 2px solid #007bff;
        }

        .edit-button:hover {
          background: #0056b3;
          border-color: #0056b3;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .delete-button {
          background: white;
          color: #dc3545;
          border: 2px solid #dc3545;
        }

        .delete-button:hover {
          background: #dc3545;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 2.5rem;
          border-radius: 12px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .modal-content h3 {
          color: #2c3e50;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        .modal-content p {
          color: #666;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .modal-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .cancel-button,
        .confirm-button {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
        }

        .cancel-button {
          background: #f8f9fa;
          color: #495057;
          border: 2px solid #e9ecef;
        }

        .cancel-button:hover {
          background: #e9ecef;
          transform: translateY(-2px);
        }

        .confirm-button {
          background: #dc3545;
          color: white;
          border: 2px solid #dc3545;
        }

        .confirm-button:hover {
          background: #c82333;
          border-color: #bd2130;
          transform: translateY(-2px);
        }

        .no-results-message {
          text-align: center;
          margin-top: 3rem;
          color: #666;
          font-size: 1.2rem;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .page-container {
            margin-left: 0;
            padding: 1rem;
          }

          .listings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ManageListings;