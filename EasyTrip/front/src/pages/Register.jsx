import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:8000';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    role: 'user'
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Create FormData object for file upload
      const registerData = new FormData();
      Object.keys(formData).forEach(key => {
        registerData.append(key, formData[key]);
      });
      if (profilePhoto) {
        registerData.append('profile_photo', profilePhoto);
      }

      // Make registration request
      const response = await axios.post('/api/register', registerData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data.token && response.data.user) {
        const { token, user } = response.data;
        
        // Store auth data
        localStorage.setItem('authToken', token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('role', user.role);

        // Set token for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Navigate to home page
        navigate('/');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h1>Register</h1>
      {error && <div className="error-message">{error}</div>}
      <form className="register-form" onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength="8"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password_confirmation">Confirm Password</label>
          <input
            type="password"
            id="password_confirmation"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleInputChange}
            required
            minLength="8"
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Register as</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            required
          >
            <option value="user">Regular User</option>
            <option value="host">Host</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="profile_photo">Profile Photo</label>
          <div className="photo-upload">
            <input
              type="file"
              id="profile_photo"
              name="profile_photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="photo-input"
            />
            <div className="photo-preview-container">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile preview" className="photo-preview" />
              ) : (
                <div className="photo-placeholder">
                  <i className="fas fa-user"></i>
                  <span>Upload Photo</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <button type="submit" className="cta-button" disabled={isLoading}>
          {isLoading ? <LoadingSpinner size="small" /> : 'Register'}
        </button>
      </form>
      <div className="login-link">
        Already have an account? <Link to="/login">Login here</Link>
      </div>

      <style>
        {`
          .register-container {
            max-width: 400px;
            margin: 2rem auto;
            padding: 2rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }

          .error-message {
            color: #dc3545;
            padding: 0.5rem;
            margin-bottom: 1rem;
            border-radius: 4px;
            background-color: #ffd2d2;
          }

          .register-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .form-group label {
            font-weight: 500;
          }

          .form-group input,
          .form-group select {
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
          }

          .photo-upload {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }

          .photo-input {
            width: 100%;
          }

          .photo-preview-container {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px dashed #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8f9fa;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .photo-preview-container:hover {
            border-color: #007bff;
          }

          .photo-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            color: #666;
          }

          .photo-placeholder i {
            font-size: 2rem;
          }

          .photo-placeholder span {
            font-size: 0.9rem;
          }

          .photo-preview {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .photo-preview:hover {
            opacity: 0.9;
          }

          .cta-button {
            position: relative;
            min-height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.75rem;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.3s ease;
          }
          
          .cta-button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
          }

          .cta-button:not(:disabled):hover {
            background: #0056b3;
          }

          .login-link {
            margin-top: 1rem;
            text-align: center;
          }

          .login-link a {
            color: #007bff;
            text-decoration: none;
          }

          .login-link a:hover {
            text-decoration: underline;
          }
        `}
      </style>
    </div>
  );
};

export default Register; 