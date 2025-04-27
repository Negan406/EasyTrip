import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';

const PendingListings = () => {
  const [pendingListings, setPendingListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchPendingListings();
  }, []);

  const fetchPendingListings = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('pendingListings')) || [];
      setPendingListings(stored);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending listings:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load pending listings'
      });
      setLoading(false);
    }
  };

  const handleApprove = async (listing) => {
    setProcessing(listing.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      // Remove from pending listings
      const updatedPending = pendingListings.filter(item => item.id !== listing.id);
      localStorage.setItem('pendingListings', JSON.stringify(updatedPending));
      setPendingListings(updatedPending);

      // Add to approved listings
      const approvedListings = JSON.parse(localStorage.getItem('listings')) || [];
      const approvedListing = { 
        ...listing, 
        status: 'approved',
        approvedDate: new Date().toISOString()
      };
      approvedListings.push(approvedListing);
      localStorage.setItem('listings', JSON.stringify(approvedListings));

      setNotification({
        type: 'success',
        message: `Listing "${listing.title}" has been approved`
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to approve listing'
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (listing) => {
    setProcessing(listing.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); 

      const updatedPending = pendingListings.filter(item => item.id !== listing.id);
      localStorage.setItem('pendingListings', JSON.stringify(updatedPending));
      setPendingListings(updatedPending);

      setNotification({
        type: 'info',
        message: `Listing "${listing.title}" has been rejected`
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to reject listing'
      });
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="content-wrap">
        <div className="container-center">
          <h1 className="page-title">Pending Listings</h1>
          {notification && (
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          )}
          {pendingListings.length === 0 ? (
            <div className="no-results-message">No pending listings to review</div>
          ) : (
            <div className="pending-listings-grid">
              {pendingListings.map(listing => (
                <div key={listing.id} className="pending-listing-card">
                  <img src={listing.mainPhoto || listing.photo} alt={listing.title} />
                  <div className="pending-listing-info">
                    <h3>{listing.title}</h3>
                    <p><strong>Location:</strong> {listing.location}</p>
                    <p><strong>Price:</strong> ${listing.price}</p>
                    <p><strong>Category:</strong> {listing.category}</p>
                    <p><strong>Host:</strong> {listing.hostEmail}</p>
                    <p><strong>Description:</strong> {listing.description}</p>
                    <p><strong>Submitted:</strong> {new Date(listing.id).toLocaleDateString()}</p>
                  </div>
                  <div className="pending-actions">
                    <button 
                      className={`approve-button ${processing === listing.id ? 'processing' : ''}`}
                      onClick={() => handleApprove(listing)}
                      disabled={processing !== null}
                    >
                      {processing === listing.id ? 'Approving...' : 'Approve'}
                    </button>
                    <button 
                      className={`reject-button ${processing === listing.id ? 'processing' : ''}`}
                      onClick={() => handleReject(listing)}
                      disabled={processing !== null}
                    >
                      {processing === listing.id ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .page-container {
          min-height: 100vh;
          position: relative;
          padding-bottom: 60px;
        }
        .content-wrap {
          padding-bottom: 2.5rem;
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
        .pending-listings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          padding: 20px;
        }
        .no-results-message {
          text-align: center;
          margin-top: 50px;
          font-size: 1.2em;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default PendingListings;
