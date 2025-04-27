import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from "../components/LoadingSpinner";

const AddListing = () => {
  const [newListing, setNewListing] = useState({
    title: '',
    location: '',
    price: '',
    category: '',
    description: '',
    mainPhoto: null,
    additionalPhotos: []
  });
  const [previews, setPreviews] = useState({
    main: null,
    additional: []
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewListing({ ...newListing, [name]: value });
  };

  const handleMainPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewListing({ ...newListing, mainPhoto: reader.result });
        setPreviews({ ...previews, main: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalPhotosChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3); // Limit to 3 additional photos
    const newPreviews = [];
    const newPhotos = [];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        newPhotos.push(reader.result);
        if (newPreviews.length === files.length) {
          setPreviews({ ...previews, additional: newPreviews });
          setNewListing({ ...newListing, additionalPhotos: newPhotos });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const listing = {
      id: Date.now(),
      title: newListing.title,
      location: newListing.location,
      price: newListing.price,
      category: newListing.category,
      description: newListing.description,
      mainPhoto: newListing.mainPhoto,
      additionalPhotos: newListing.additionalPhotos,
      status: 'pending',
      hostEmail: localStorage.getItem('email'),
      createdAt: new Date().toISOString()
    };

    try {
      const pendingListings = JSON.parse(localStorage.getItem('pendingListings')) || [];
      pendingListings.push(listing);
      localStorage.setItem('pendingListings', JSON.stringify(pendingListings));
      
      setTimeout(() => {
        setLoading(false);
        setShowConfirmation(true);
      }, 1000);
    } catch (error) {
      console.error('Failed to add listing:', error);
      alert('Failed to add listing. Please try again.');
      setLoading(false);
    }
  };

  const handleConfirmationOk = () => {
    setShowConfirmation(false);
    navigate('/manage-listings');
  };

  return (
    <> 
      <br /><br />
      <div className="add-listing-container">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <h1>Add New Listing</h1>
            <form onSubmit={handleSubmit} className="listing-form">
              <div className="form-grid">
                <div className="form-left">
                  <input type="text" name="title" placeholder="Title" value={newListing.title} onChange={handleInputChange} required />
                  <input type="text" name="location" placeholder="Location" value={newListing.location} onChange={handleInputChange} required />
                  <input type="number" name="price" placeholder="Price" value={newListing.price} onChange={handleInputChange} required />
                  <input type="text" name="category" placeholder="Category" value={newListing.category} onChange={handleInputChange} required />
                  <textarea name="description" placeholder="Description" value={newListing.description} onChange={handleInputChange} required />
                </div>
                
                <div className="form-right">
                  <div className="photo-upload-section">
                    <div className="main-photo-upload">
                      <h3>Main Photo</h3>
                      <input type="file" accept="image/*" onChange={handleMainPhotoChange} required />
                      {previews.main && <img src={previews.main} alt="Main preview" className="main-preview" />}
                    </div>

                    <div className="additional-photos-upload">
                      <h3>Additional Photos (Max 3)</h3>
                      <input type="file" accept="image/*" multiple onChange={handleAdditionalPhotosChange} />
                      <div className="additional-previews">
                        {previews.additional.map((preview, index) => (
                          <img key={index} src={preview} alt={`Additional ${index + 1}`} className="additional-preview" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" className="cta-button">Add Listing</button>
            </form>
          </>
        )}
      </div>

      {showConfirmation && (
        <>
          <div className="modal-overlay" />
          <div className="submission-confirmation">
            <h3>Success!</h3>
            <p>Your listing has been submitted for admin approval</p>
            <button className="confirm-button" onClick={handleConfirmationOk}>
              OK
            </button>
          </div>
        </>
      )}

      <style jsx>{`
        .add-listing-container {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .listing-form input,
        .listing-form textarea {
          width: 100%;
          padding: 12px;
          margin-bottom: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
        }

        .photo-upload-section {
          background: #f9f9f9;
          padding: 1.5rem;
          border-radius: 8px;
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

        .cta-button:hover {
          background: #0056b3;
        }
      `}</style>
    </>
  );
};

export default AddListing;