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
          position: relative;
          left: -100px;
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
          position: relative;
          
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
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .listing-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .listing-content {
          padding: 1.5rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .listing-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: auto;
          padding: 0.5rem 1rem 1rem;
        }

        .edit-button,
        .delete-button {
          flex: 1;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          position: relative;
          overflow: hidden;
        }

        .edit-button {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border: none;
        }

        .edit-button:hover {
          background: linear-gradient(135deg, #0056b3, #004085);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .edit-button:active {
          transform: translateY(0);
        }

        .delete-button {
          background: white;
          color: #dc3545;
          border: 2px solid #dc3545;
        }

        .delete-button:hover {
          background: linear-gradient(135deg, #dc3545, #bd2130);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
          border-color: transparent;
        }

        .delete-button:active {
          transform: translateY(0);
        }

        .edit-button::before,
        .delete-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: 0.5s;
        }

        .edit-button:hover::before,
        .delete-button:hover::before {
          left: 100%;
        }

        .listings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
          padding: 1rem;
        }

        .listing-image {
          position: relative;
          height: 220px;
          overflow: hidden;
        }

        .listing-image::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40%;
          background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);
          pointer-events: none;
        }

        .listing-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .listing-card:hover .listing-image img {
          transform: scale(1.1);
        }

        .listing-content h3 {
          margin: 0 0 0.75rem 0;
          color: #2c3e50;
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
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
          font-size: 1.2rem;
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
            padding: 0.5rem;
          }

          .listing-card {
            max-width: 100%;
          }

          .listing-actions {
            padding: 0.5rem 1rem 1rem;
          }

          .edit-button,
          .delete-button {
            padding: 0.65rem 0.75rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ManageListings;