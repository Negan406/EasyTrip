import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCrown, faPhone } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import Sidebar from '../components/Sidebar';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/150x150?text=User';
    
    // If it's already a full URL
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // For storage paths
    if (imageUrl.includes('storage/') || imageUrl.startsWith('profiles/') || imageUrl.startsWith('listings/')) {
      const cleanPath = imageUrl
        .replace('storage/', '')  // Remove 'storage/' if present
        .replace(/^\/+/, '');     // Remove leading slashes
      return `http://localhost:8000/storage/${cleanPath}`;
    }
    
    // For any other case, assume it's a relative path in storage
    const cleanPath = imageUrl.replace(/^\/+/, '');
    return `http://localhost:8000/storage/${cleanPath}`;
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
        setUsers(response.data.users);
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

  if (loading) return <LoadingSpinner />;

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
                    <img 
                      src={getImageUrl(user.profile_photo)}
                      alt={user.name}
                      
                    />
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
          }

          .user-avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
          }

          .user-avatar:hover {
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