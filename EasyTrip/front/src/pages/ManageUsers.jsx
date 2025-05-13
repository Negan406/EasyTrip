import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, faCrown, faPhone, faUserGear, 
  faShield, faUserPlus, faEnvelope, faKey, faUser
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import Sidebar from '../components/Sidebar';

// Add loading animation constants
const LOADING_MESSAGES = [
  "Loading user profiles...",
  "Fetching account information...",
  "Preparing user management tools...",
  "Retrieving user data...",
  "Almost there..."
];

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const navigate = useNavigate();

  // Add loading message rotation
  useEffect(() => {
    if (!loading) return;
    
    let messageIndex = 0;
    const intervalId = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[messageIndex]);
    }, 2000); // Change message every 2 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, [loading]);

  useEffect(() => {
    const fetchDebugLogs = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:8000/api/users', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success && response.data.users && response.data.users.length > 0) {
          const sampleUser = response.data.users[0];
          console.log('Sample user data format:', sampleUser);
          console.log('Profile photo value:', sampleUser.profile_photo);
          
          // Test the URL format that AccountSettings.jsx uses
          if (sampleUser.profile_photo) {
            const testUrl = `http://localhost:8000/storage/${sampleUser.profile_photo}`;
            console.log('Test URL format:', testUrl);
            
            // Fetch the image to check if it exists
            fetch(testUrl)
              .then(res => {
                console.log('Image fetch status:', res.status, res.ok);
              })
              .catch(err => console.error('Image fetch error:', err));
          }
        }
      } catch (error) {
        console.error('Debug log error:', error);
      }
    };
    
    if (localStorage.getItem('role') === 'admin') {
      fetchDebugLogs();
    }
  }, []);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/150x150?text=User';
    
    // If it's already a full URL, return it as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Use the same format as AccountSettings.jsx
    // This assumes the API returns paths without 'storage/' prefix
    return `http://localhost:8000/storage/${imageUrl.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:8000/api/users', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Process users to ensure consistent photo URLs
        const processedUsers = response.data.users.map(user => ({
          ...user,
          profile_photo: user.profile_photo || null
        }));
        
        setUsers(processedUsers);
      } else {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users. Please try again later.';
      setError(errorMessage);
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (userId) => {
    const userToDelete = users.find(user => user.id === userId);
    if (userToDelete.role === 'admin') {
      setNotification({
        type: 'error',
        message: 'Cannot delete admin users'
      });
      return;
    }
    setDeleteConfirmation(userId);
  };

  const handleConfirmDelete = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`http://localhost:8000/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setUsers(users.filter(user => user.id !== userId));
        setNotification({
          type: 'success',
          message: 'User deleted successfully'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete user'
      });
    } finally {
      setDeleteConfirmation(null);
    }
  };

  if (loading) {
    return (
      <div className="users-loading-container">
        <div className="users-loading-content">
          <LoadingSpinner size="large" color="#ff385c" />
          <h3 className="loading-title">{loadingMessage}</h3>
          <div className="loading-progress">
            <div className="progress-bar"></div>
          </div>
          <div className="loading-users">
            <span className="user-type"><FontAwesomeIcon icon={faUserGear} /> Administrators</span>
            <span className="user-type"><FontAwesomeIcon icon={faKey} /> Account Managers</span>
            <span className="user-type"><FontAwesomeIcon icon={faEnvelope} /> Email Subscribers</span>
            <span className="user-type"><FontAwesomeIcon icon={faUserPlus} /> New Users</span>
          </div>
        </div>
        <div className="floating-icons">
          {[
            faUserGear, faShield, faEnvelope, faPhone, 
            faUserPlus, faKey, faCrown, faTrash
          ].map((icon, i) => (
            <FontAwesomeIcon 
              key={i} 
              icon={icon} 
              className={`floating-icon icon-${i + 1}`} 
            />
          ))}
        </div>
        <style jsx>{`
          .users-loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            width: 100%;
            position: relative;
            background-color: #f8f9fa;
          }
          
          .users-loading-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            background-color: white;
            border-radius: 1rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 90%;
            text-align: center;
            animation: fadeIn 0.5s ease;
            z-index: 1;
          }
          
          .loading-title {
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
            font-size: 1.5rem;
            font-weight: 600;
            color: #343a40;
          }
          
          .loading-progress {
            width: 80%;
            height: 6px;
            background-color: #e9ecef;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 1rem;
          }
          
          .progress-bar {
            height: 100%;
            width: 0;
            background: linear-gradient(to right, #ff385c, #ff8a65);
            border-radius: 3px;
            animation: progress 2s ease infinite;
          }
          
          .loading-users {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
            margin-top: 1.5rem;
          }
          
          .user-type {
            background: rgba(255, 56, 92, 0.1);
            color: #ff385c;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 5px;
            animation: breathe 3s infinite ease-in-out;
          }
          
          .user-type:nth-child(1) { animation-delay: 0s; }
          .user-type:nth-child(2) { animation-delay: 0.5s; }
          .user-type:nth-child(3) { animation-delay: 1s; }
          .user-type:nth-child(4) { animation-delay: 1.5s; }
          
          @keyframes breathe {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
          }
          
          .floating-icons {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
          }
          
          .floating-icon {
            position: absolute;
            color: rgba(255, 56, 92, 0.1);
            font-size: 20px;
            animation-name: float;
            animation-duration: 10s;
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
          }
          
          .icon-1 { left: 10%; top: 20%; animation-delay: 0s; font-size: 18px; }
          .icon-2 { left: 20%; top: 60%; animation-delay: 1s; font-size: 24px; }
          .icon-3 { left: 30%; top: 30%; animation-delay: 2s; font-size: 16px; }
          .icon-4 { left: 50%; top: 70%; animation-delay: 3s; font-size: 22px; }
          .icon-5 { left: 65%; top: 40%; animation-delay: 4s; font-size: 19px; }
          .icon-6 { left: 75%; top: 20%; animation-delay: 5s; font-size: 25px; }
          .icon-7 { left: 85%; top: 50%; animation-delay: 6s; font-size: 17px; }
          .icon-8 { left: 90%; top: 80%; animation-delay: 7s; font-size: 21px; }
          
          @keyframes float {
            0% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
            25% { transform: translateY(-20px) rotate(5deg); opacity: 0.3; }
            50% { transform: translateY(-35px) rotate(0deg); opacity: 0.1; }
            75% { transform: translateY(-20px) rotate(-5deg); opacity: 0.3; }
            100% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
          }
          
          @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 95%; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @media (max-width: 768px) {
            .users-loading-content {
              padding: 2rem;
            }
            
            .loading-title {
              font-size: 1.2rem;
            }
            
            .loading-users {
              flex-direction: column;
              align-items: center;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
    <div className="manage-users-container">
        <div className="content-wrapper">
      <h1>Manage Users</h1>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

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

          <div className="users-grid">
            {users.map(user => (
              <div key={user.id} className="user-card" data-aos="fade-up">
                <div className="user-info">
                  <div className="user-photo-container">
                    {user.profile_photo ? (
                      <img 
                        src={getImageUrl(user.profile_photo)}
                        alt={user.name}
                        className="user-avatar"
                        onError={(e) => {
                          console.error('Image failed to load:', {
                            userId: user.id,
                            userName: user.name,
                            original: user.profile_photo,
                            attempted: e.target.src
                          });
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150x150?text=User';
                        }}
                      />
                    ) : (
                      <div className="default-avatar">
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                    )}
                    {user.role === 'admin' && (
                      <div className="admin-badge">
                        <FontAwesomeIcon icon={faCrown} />
                      </div>
                    )}
                  </div>
                  <div className="user-details">
                    <h3>{user.name}</h3>
                    <p className="user-email">{user.email}</p>
                    {user.phone && (
                      <p className="user-phone">
                        <FontAwesomeIcon icon={faPhone} /> {user.phone}
                      </p>
                    )}
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteClick(user.id)}
                  disabled={user.role === 'admin'}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  <span>Delete</span>
                </button>
              </div>
            ))}
          </div>

          {deleteConfirmation && (
            <>
              <div className="modal-overlay" onClick={() => setDeleteConfirmation(null)} />
              <div className="confirmation-modal">
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                <div className="modal-buttons">
                  <button 
                    className="cancel-button"
                    onClick={() => setDeleteConfirmation(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="confirm-button"
                    onClick={() => handleConfirmDelete(deleteConfirmation)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <style>{`
          .manage-users-container {
            margin-left: 20px;
            padding: 2rem;
            position: relative;
            left: 280px;
          }

          .content-wrapper {
            max-width: 1200px;
            margin: 0 auto;
          }

          h1 {
            margin-bottom: 2rem;
            color: #333;
          }

          .users-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
          }

          .user-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            gap: 1rem;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
          }

          .user-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }

          .user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .user-photo-container {
            position: relative;
            flex-shrink: 0;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            overflow: hidden;
            background-color: #f5f5f5;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-right: 1rem;
            border: 3px solid white;
          }

          .user-avatar {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }

          .user-photo-container:hover .user-avatar {
            transform: scale(1.05);
          }

          .admin-badge {
            position: absolute;
            bottom: 0;
            right: 0;
            background: #ffd700;
            color: #000;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
            font-size: 0.8rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            z-index: 2;
          }

          .user-details {
            flex: 1;
          }

          .user-details h3 {
            margin: 0;
            color: #333;
            font-size: 1.1rem;
          }

          .user-details p {
            margin: 0.25rem 0;
            color: #666;
            font-size: 0.9rem;
          }

          .role-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
            text-transform: uppercase;
          }

          .role-badge.admin {
            background: #ffd700;
            color: #000;
          }

          .role-badge.user {
            background: #e9ecef;
            color: #495057;
          }

          .delete-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 6px;
            background: #dc3545;
            color: white;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }

          .delete-button:hover:not(:disabled) {
            background: #c82333;
          }

          .delete-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
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

          .confirmation-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 1001;
            max-width: 400px;
            width: 90%;
          }

          .modal-buttons {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
          }

          .cancel-button,
          .confirm-button {
            flex: 1;
            padding: 0.75rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .cancel-button {
            background: #e9ecef;
            color: #495057;
          }

          .confirm-button {
            background: #dc3545;
            color: white;
          }

          .cancel-button:hover {
            background: #dee2e6;
          }

          .confirm-button:hover {
            background: #c82333;
          }

          .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: slideIn 0.3s ease;
            z-index: 1000;
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
            opacity: 0.8;
            transition: opacity 0.3s ease;
          }

          .close-btn:hover {
            opacity: 1;
          }

          .error-message {
            background: #ffe6e6;
            color: #dc3545;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            text-align: center;
          }

          .default-avatar {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ccc;
            font-size: 2rem;
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
            .manage-users-container {
              padding: 1rem;
              left: 0;
              margin-left: 0;
              margin-top: 70px; /* Add space for the mobile menu */
            }

            .users-grid {
              grid-template-columns: 1fr;
            }

            .confirmation-modal {
              width: 95%;
              padding: 1.5rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ManageUsers;