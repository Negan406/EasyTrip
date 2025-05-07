import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from "../components/LoadingSpinner";
import axios from "axios";

const AddListing = () => {
  const [newListing, setNewListing] = useState({
    title: '',
    location: '',
    price: '',
    category: 'beach-houses', // Default category
    description: '',
    main_photo: null,
    photos: []
  });
  const [previews, setPreviews] = useState({
    main: null,
    additional: []
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const categories = [
    { value: 'beach-houses', label: 'Beach Houses' },
    { value: 'city-apartments', label: 'City Apartments' },
    { value: 'mountain-cabins', label: 'Mountain Cabins' },
    { value: 'luxury-villas', label: 'Luxury Villas' },
    { value: 'pools', label: 'Pools' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewListing({ ...newListing, [name]: value });
  };

  const handleMainPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Main photo must be less than 5MB');
        return;
      }
      setNewListing({ ...newListing, main_photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews({ ...previews, main: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalPhotosChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3); // Limit to 3 additional photos
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    
    if (oversizedFiles.length > 0) {
      setError('All photos must be less than 5MB');
      return;
    }

    setNewListing({ ...newListing, photos: files });
    
    const newPreviews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setPreviews({ ...previews, additional: newPreviews });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please log in to add a listing');
      }

      const formData = new FormData();
      formData.append('title', newListing.title);
      formData.append('description', newListing.description);
      formData.append('location', newListing.location);
      formData.append('price', newListing.price);
      formData.append('category', newListing.category);
      formData.append('main_photo', newListing.main_photo);
      
      if (newListing.photos.length > 0) {
        newListing.photos.forEach(photo => {
          formData.append('photos[]', photo);
        });
      }

      const response = await axios.post('http://localhost:8000/api/listings', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setShowConfirmation(true);
      } else {
        throw new Error(response.data.message || 'Failed to create listing');
      }
    } catch (error) {
      console.error('Failed to add listing:', error);
      setError(error.response?.data?.message || error.message || 'Failed to add listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmationOk = () => {
    setShowConfirmation(false);
    navigate('/manage-listings');
  };

  return (
    <div className="add-listing-container">
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <h1>Add New Listing</h1>
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
                  value={newListing.title} 
                  onChange={handleInputChange} 
                  required 
                />
                <input 
                  type="text" 
                  name="location" 
                  placeholder="Location" 
                  value={newListing.location} 
                  onChange={handleInputChange} 
                  required 
                />
                <input 
                  type="number" 
                  name="price" 
                  placeholder="Price per night" 
                  value={newListing.price} 
                  onChange={handleInputChange} 
                  required 
                  min="0"
                />
                <select 
                  name="category" 
                  value={newListing.category} 
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
                  value={newListing.description} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="form-right">
                <div className="photo-upload-section">
                  <div className="main-photo-upload">
                    <h3>Main Photo (Required)</h3>
                    <p className="photo-hint">Max size: 5MB</p>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/jpg" 
                      onChange={handleMainPhotoChange} 
                      required 
                    />
                    {previews.main && (
                      <img src={previews.main} alt="Main preview" className="main-preview" />
                    )}
                  </div>

                  <div className="additional-photos-upload">
                    <h3>Additional Photos (Optional)</h3>
                    <p className="photo-hint">Max 3 photos, 5MB each</p>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/jpg" 
                      multiple 
                      onChange={handleAdditionalPhotosChange} 
                    />
                    <div className="additional-previews">
                      {previews.additional.map((preview, index) => (
                        <img key={index} src={preview} alt={`Additional ${index + 1}`} className="additional-preview" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button type="submit" className="cta-button" disabled={loading}>
              {loading ? 'Adding Listing...' : 'Add Listing'}
            </button>
          </form>
        </>
      )}

      {showConfirmation && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h3>Success!</h3>
            <p>Your listing has been submitted for admin approval</p>
            <button onClick={handleConfirmationOk}>OK</button>
          </div>
        </div>
      )}

      <style>{`
        .add-listing-container {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

        .main-photo-upload,
        .additional-photos-upload {
          margin-bottom: 1.5rem;
        }

        .main-preview {
          width: 100%;
          height: 300px;
          object-fit: cover;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .additional-previews {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-top: 1rem;
        }

        .additional-preview {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 8px;
        }

        .cta-button {
          width: 100%;
          padding: 1rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .cta-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .cta-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .confirmation-modal {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
          max-width: 400px;
          width: 90%;
        }

        .confirmation-modal button {
          padding: 0.8rem 2rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          margin-top: 1rem;
        }

        .confirmation-modal button:hover {
          background: #0056b3;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .add-listing-container {
            padding: 1rem;
            margin: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AddListing;