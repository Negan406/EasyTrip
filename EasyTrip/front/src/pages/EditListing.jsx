import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from "../components/LoadingSpinner";
import axios from 'axios';
import Sidebar from "../components/Sidebar";

const EditListing = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const categories = [
    { value: 'beach-houses', label: 'Beach Houses' },
    { value: 'city-apartments', label: 'City Apartments' },
    { value: 'mountain-cabins', label: 'Mountain Cabins' },
    { value: 'luxury-villas', label: 'Luxury Villas' },
    { value: 'pools', label: 'Pools' }
  ];

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
      setError(error.response?.data?.message || 'Failed to fetch listing');
      setTimeout(() => navigate('/manage-listings'), 2000);
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
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Main photo must be less than 5MB');
        return;
      }
      setMainPhoto(file);
      setMainPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const updateData = new FormData();

      Object.keys(formData).forEach(key => {
        updateData.append(key, formData[key]);
      });

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
        navigate('/manage-listings');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update listing');
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
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="listing-form">
          <div className="form-grid">
            <div className="form-left">
              <input 
                type="text" 
                name="title" 
                placeholder="Title" 
                value={formData.title} 
                onChange={handleInputChange} 
                required 
              />
              <input 
                type="text" 
                name="location" 
                placeholder="Location" 
                value={formData.location} 
                onChange={handleInputChange} 
                required 
              />
              <input 
                type="number" 
                name="price" 
                placeholder="Price per night" 
                value={formData.price} 
                onChange={handleInputChange} 
                required 
                min="0"
                step="0.01"
              />
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleInputChange} 
                required
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <textarea 
                name="description" 
                placeholder="Description" 
                value={formData.description} 
                onChange={handleInputChange} 
                required 
                rows="6"
              />
            </div>
            
            <div className="form-right">
              <div className="photo-upload-section">
                <div className="main-photo-upload">
                  <h3>Main Photo</h3>
                  <p className="photo-hint">Max size: 5MB</p>
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/jpg" 
                    onChange={handleMainPhotoChange}
                    className="file-input"
                  />
                  {mainPhotoPreview && (
                    <img
                      src={mainPhotoPreview}
                      alt="Main preview"
                      className="main-preview"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="cta-button" disabled={loading}>
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
          max-width: 1200px;
          margin: 2rem auto 2rem 250px;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        h1 {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 2rem;
          font-size: 2rem;
        }

        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 8px;
          text-align: center;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .listing-form input,
        .listing-form textarea,
        .listing-form select {
          width: 100%;
          padding: 12px;
          margin-bottom: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s ease;
        }

        .listing-form input:focus,
        .listing-form textarea:focus,
        .listing-form select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
        }

        .listing-form textarea {
          height: 150px;
          resize: vertical;
        }

        .photo-upload-section {
          background: #f9f9f9;
          padding: 1.5rem;
          border-radius: 8px;
        }

        .photo-hint {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.5rem;
        }

        .main-photo-upload {
          margin-bottom: 1.5rem;
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
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .cta-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .cta-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #0056b3, #004085);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,123,255,0.2);
        }

        .cta-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .cta-button:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .edit-listing-container {
            margin: 1rem;
            padding: 1rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          h1 {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EditListing;