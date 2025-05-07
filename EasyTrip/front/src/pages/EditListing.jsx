import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from "../components/LoadingSpinner";
import axios from 'axios';
import Sidebar from "../components/Sidebar";

const EditListing = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    category: ''
  });
  const [mainPhoto, setMainPhoto] = useState(null);
  const [mainPhotoPreview, setMainPhotoPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://localhost:8000/api/listings/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        const listingData = response.data.listing;
        setListing(listingData);
        setFormData({
          title: listingData.title,
          description: listingData.description,
          location: listingData.location,
          price: listingData.price,
          category: listingData.category
        });
        setMainPhotoPreview(`http://localhost:8000/storage/${listingData.main_photo}`);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to fetch listing'
      });
      navigate('/manage-listings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMainPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainPhoto(file);
      setMainPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const updateData = new FormData();

      // Append form data
      Object.keys(formData).forEach(key => {
        updateData.append(key, formData[key]);
      });

      // Append main photo if changed
      if (mainPhoto) {
        updateData.append('main_photo', mainPhoto);
      }

      const response = await axios.post(
        `http://localhost:8000/api/listings/${id}?_method=PUT`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setNotification({
          type: 'success',
          message: 'Listing updated successfully'
        });
        setTimeout(() => navigate('/manage-listings'), 1500);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update listing'
      });
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!listing) return <div>Listing not found</div>;

  return (
    <div className="app-container">
      <Sidebar />
      <div className="edit-listing-container">
        <h1>Edit Listing</h1>
        
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="listing-form">
          <div className="form-grid">
            <div className="form-left">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price per night</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="beach-houses">Beach Houses</option>
                  <option value="city-apartments">City Apartments</option>
                  <option value="mountain-cabins">Mountain Cabins</option>
                  <option value="luxury-villas">Luxury Villas</option>
                  <option value="pools">Pools</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="6"
                />
              </div>
            </div>

            <div className="form-right">
              <div className="photo-upload-section">
                <div className="main-photo-upload">
                  <h3>Main Photo</h3>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainPhotoChange}
                    className="file-input"
                  />
                  {mainPhotoPreview && (
                    <img
                      src={mainPhotoPreview}
                      alt="Main preview"
                      className="main-preview"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? <LoadingSpinner size="small" /> : 'Save Changes'}
          </button>
        </form>
      </div>

      <style>{`
        .app-container {
          display: flex;
          min-height: 100vh;
          background: #f8f9fa;
        }

        .edit-listing-container {
          flex: 1;
          padding: 2rem;
          margin-left: 250px;
          max-width: 1200px;
          margin: 2rem auto 2rem 250px;
        }

        h1 {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 2rem;
        }

        .notification {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          text-align: center;
          color: white;
        }

        .notification.success {
          background: #28a745;
        }

        .notification.error {
          background: #dc3545;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #2c3e50;
          font-weight: 500;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
        }

        .photo-upload-section {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .main-photo-upload h3 {
          margin-bottom: 1rem;
          color: #2c3e50;
        }

        .file-input {
          margin-bottom: 1rem;
        }

        .main-preview {
          width: 100%;
          height: 300px;
          object-fit: cover;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .submit-button {
          width: 100%;
          padding: 1rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .submit-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .edit-listing-container {
            margin-left: 0;
            padding: 1rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EditListing;