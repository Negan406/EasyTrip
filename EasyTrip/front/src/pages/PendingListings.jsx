import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';
import ListingCard from '../components/ListingCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const PendingListings = () => {
  const [pendingListings, setPendingListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [processing, setProcessing] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      navigate('/');
      return;
    }
    fetchPendingListings();
  }, [navigate]);

  const fetchPendingListings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:8000/api/listings/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setPendingListings(response.data.listings || []);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching pending listings:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to load pending listings'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (listing) => {
    setProcessing(listing.id);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`http://localhost:8000/api/listings/${listing.id}/approve`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setPendingListings(current => current.filter(item => item.id !== listing.id));
        setNotification({
          type: 'success',
          message: `"${listing.title}" has been approved successfully`
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to approve listing'
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (listing) => {
    setProcessing(listing.id);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`http://localhost:8000/api/listings/${listing.id}/reject`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setPendingListings(current => current.filter(item => item.id !== listing.id));
        setNotification({
          type: 'info',
          message: `"${listing.title}" has been rejected`
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to reject listing'
      });
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="pending-page">
      <main className="pending-container">
        <h1 className="page-title">Pending Listings</h1>
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}
        {pendingListings.length === 0 ? (
          <div className="no-results-message">
            <FontAwesomeIcon icon={faCheck} className="check-icon" />
            <p>No pending listings to review</p>
          </div>
        ) : (
          <div className="pending-grid">
            {pendingListings.map(listing => (
              <div key={listing.id} className="pending-item" data-aos="fade-up">
                <ListingCard listing={listing} />
                <div className="action-container">
                  <button 
                    className={`action-button approve ${processing === listing.id ? 'processing' : ''}`}
                    onClick={() => handleApprove(listing)}
                    disabled={processing !== null}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    <span>Accept</span>
                  </button>
                  <button 
                    className={`action-button reject ${processing === listing.id ? 'processing' : ''}`}
                    onClick={() => handleReject(listing)}
                    disabled={processing !== null}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        .pending-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-title {
          text-align: center;
          margin-bottom: 2rem;
          color: #222;
          font-size: 2.5rem;
          font-weight: 600;
        }

        .pending-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          padding: 1rem 0;
        }

        .pending-item {
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .pending-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.12);
        }

        .action-container {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          background: white;
          border-top: 1px solid #eee;
        }

        .action-button {
          flex: 1;
          padding: 0.875rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.2s ease;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .action-button.approve {
          background: #28a745;
        }

        .action-button.reject {
          background: #dc3545;
        }

        .action-button.approve:hover:not(:disabled) {
          background: #218838;
          transform: translateY(-2px);
        }

        .action-button.reject:hover:not(:disabled) {
          background: #c82333;
          transform: translateY(-2px);
        }

        .action-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none !important;
        }

        .action-button.processing {
          position: relative;
          padding-right: 2.5rem;
        }

        .action-button.processing::after {
          content: '';
          position: absolute;
          right: 1rem;
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid rgba(255,255,255,0.5);
          border-right-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .no-results-message {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          margin: 2rem auto;
          max-width: 500px;
        }

        .check-icon {
          font-size: 3rem;
          color: #28a745;
          margin-bottom: 1.5rem;
        }

        .no-results-message p {
          font-size: 1.25rem;
          color: #666;
          margin: 0;
        }

        @media (max-width: 768px) {
          .pending-page {
            padding: 1rem;
          }

          .page-title {
            font-size: 2rem;
            margin-bottom: 1.5rem;
          }

          .pending-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .action-container {
            padding: 1rem;
          }

          .action-button {
            padding: 0.75rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PendingListings;
