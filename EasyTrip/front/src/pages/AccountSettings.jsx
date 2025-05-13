import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faCreditCard, faBell, faShieldAlt, faCamera } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const AccountSettings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setMessage({
            type: 'error',
            text: 'Please log in to access account settings'
          });
          return;
        }

        const response = await axios.get('http://localhost:8000/api/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.success) {
          const userData = response.data.user;
          setFormData(prevState => ({
            ...prevState,
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            current_password: '',
            new_password: '',
            confirm_password: ''
          }));
          
          if (userData.profile_photo) {
            setPreviewUrl(`http://localhost:8000/storage/${userData.profile_photo}`);
          }
        } else {
          // If response.data.success is not present, try to use the user data directly
          // This handles both old and new API response formats
          const userData = response.data.user || response.data;
          if (userData) {
            setFormData(prevState => ({
              ...prevState,
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || '',
              current_password: '',
              new_password: '',
              confirm_password: ''
            }));
            
            if (userData.profile_photo) {
              setPreviewUrl(`http://localhost:8000/storage/${userData.profile_photo}`);
            }
          } else {
            throw new Error('Invalid response format from server');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setMessage({
          type: 'error',
          text: error.response?.data?.message || 'Failed to load user data. Please try again.'
        });
      }
    };

    fetchUserData();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      
      if (profilePhoto) {
        formDataToSend.append('profile_photo', profilePhoto);
      }

      const response = await axios.post('http://localhost:8000/api/user/update', 
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile'
      });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');

    if (formData.new_password !== formData.confirm_password) {
      setMessage({
        type: 'error',
        text: 'New passwords do not match'
      });
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/user/change-password',
        {
          current_password: formData.current_password,
          new_password: formData.new_password
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage({
        type: 'success',
        text: 'Password changed successfully!'
      });
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to change password'
      });
    }
  };

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="account-container">
        <h1>Account Settings</h1>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
            <button className="close-message" onClick={() => setMessage({ type: '', text: '' })}>×</button>
          </div>
        )}

        <div className="account-content">
          <div className="account-menu">
            <button 
              onClick={() => setActiveSection('profile')}
              className={`account-menu-item ${activeSection === 'profile' ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={faUser} /> Personal Information
            </button>
            <button 
              onClick={() => setActiveSection('security')}
              className={`account-menu-item ${activeSection === 'security' ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={faLock} /> Password & Security
            </button>
            <button 
              onClick={() => setActiveSection('payments')}
              className={`account-menu-item ${activeSection === 'payments' ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={faCreditCard} /> Payments & Payouts
            </button>
            <button 
              onClick={() => setActiveSection('notifications')}
              className={`account-menu-item ${activeSection === 'notifications' ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={faBell} /> Notifications
            </button>
            <button 
              onClick={() => setActiveSection('privacy')}
              className={`account-menu-item ${activeSection === 'privacy' ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={faShieldAlt} /> Privacy & Sharing
            </button>
          </div>

          <div className="account-details">
            {activeSection === 'profile' && (
              <div className="profile-section">
                <div className="profile-header">
                  <div className="profile-picture-container">
                    <div className="profile-picture">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Profile" />
                      ) : (
                        <FontAwesomeIcon icon={faUser} className="default-avatar" />
                      )}
                      <label className="photo-upload-label" htmlFor="photo-upload">
                        <FontAwesomeIcon icon={faCamera} />
                        <input
                          type="file"
                          id="photo-upload"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="profile-info">
                    <h2>Personal Information</h2>
                    <p>Update your information and how it's shared with the EasyTrip community</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="profile-form">
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <button type="submit" className="save-button">Save Changes</button>
                </form>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="security-section">
                <div className="section-header">
                  <h2>Password & Security</h2>
                  <p>Manage your password and security preferences</p>
                </div>
                <form onSubmit={handlePasswordChange} className="password-form">
                  <div className="form-group">
                    <label htmlFor="current_password">Current Password</label>
                    <input
                      type="password"
                      id="current_password"
                      value={formData.current_password}
                      onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                      placeholder="Enter your current password"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="new_password">New Password</label>
                    <input
                      type="password"
                      id="new_password"
                      value={formData.new_password}
                      onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                      placeholder="Enter your new password"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirm_password">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirm_password"
                      value={formData.confirm_password}
                      onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                      placeholder="Confirm your new password"
                    />
                  </div>
                  <button type="submit" className="save-button">Change Password</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .account-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .message {
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .message.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .close-message {
          background: none;
          border: none;
          color: inherit;
          font-size: 1.2rem;
          cursor: pointer;
        }

        .account-content {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 2rem;
          margin-top: 2rem;
        }

        .account-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .account-menu-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 1rem;
          border: none;
          background: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #484848;
          text-align: left;
          font-size: 1rem;
        }

        .account-menu-item:hover {
          background: #f7f7f7;
        }

        .account-menu-item.active {
          background: #222;
          color: white;
        }

        .profile-section, .security-section {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .profile-header {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          align-items: flex-start;
        }

        .profile-picture-container {
          position: relative;
        }

        .profile-picture {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          position: relative;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-picture img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .default-avatar {
          font-size: 3rem;
          color: #ccc;
        }

        .photo-upload-label {
          position: absolute;
          bottom: 0;
          right: 0;
          background: #222;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .photo-upload-label:hover {
          background: #000;
          transform: scale(1.1);
        }

        .profile-info {
          flex: 1;
        }

        .profile-info h2 {
          margin: 0 0 0.5rem 0;
          color: #222;
        }

        .profile-info p {
          color: #666;
          margin: 0;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #484848;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus {
          border-color: #222;
          outline: none;
        }

        .form-group input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .save-button {
          background: #222;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .save-button:hover {
          background: #000;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .account-content {
            grid-template-columns: 1fr;
          }

          .account-menu {
            margin-bottom: 1rem;
          }

          .profile-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .profile-picture {
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default AccountSettings;