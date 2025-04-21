import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from "../components/LoadingSpinner";

const EditListing = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState({
    main: null,
    additional: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedListings = JSON.parse(localStorage.getItem('listings')) || [];
    const currentListing = storedListings.find((listing) => listing.id === parseInt(id));
    if (currentListing) {
      setListing(currentListing);
      setPreviews({
        main: currentListing.mainPhoto,
        additional: currentListing.additionalPhotos || []
      });
    } else {
      navigate('/manage-listings');
    }
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setListing({ ...listing, [name]: value });
  };

  const handleMainPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setListing({ ...listing, mainPhoto: reader.result });
        setPreviews({ ...previews, main: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalPhotosChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const newPreviews = [];
    const newPhotos = [];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        newPhotos.push(reader.result);
        if (newPreviews.length === files.length) {
          setPreviews({ ...previews, additional: newPreviews });
          setListing({ ...listing, additionalPhotos: newPhotos });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const storedListings = JSON.parse(localStorage.getItem('listings')) || [];
      const updatedListings = storedListings.map((item) =>
        item.id === listing.id ? {
          ...listing,
          updatedAt: new Date().toISOString()
        } : item
      );
      localStorage.setItem('listings', JSON.stringify(updatedListings));
      setLoading(false);
      navigate('/manage-listings');
    }, 1000);
  };

  if (!listing) return <div>Loading...</div>;

  return (
    <>
      <br /><br />
      <div className="edit-listing-container">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <h1>Edit Listing</h1>
            <form onSubmit={handleSubmit} className="listing-form">
              <div className="form-grid">
                <div className="form-left">
                  <input type="text" name="title" value={listing.title} onChange={handleInputChange} required />
                  <input type="text" name="location" value={listing.location} onChange={handleInputChange} required />
                  <input type="number" name="price" value={listing.price} onChange={handleInputChange} required />
                  <input type="text" name="category" value={listing.category} onChange={handleInputChange} required />
                  <textarea name="description" value={listing.description} onChange={handleInputChange} required />
                </div>
                
                <div className="form-right">
                  <div className="photo-upload-section">
                    <div className="main-photo-upload">
                      <h3>Main Photo</h3>
                      <input type="file" accept="image/*" onChange={handleMainPhotoChange} />
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
              <button type="submit" className="cta-button">Save Changes</button>
            </form>
          </>
        )}
      </div>

      <style jsx>{`
        .edit-listing-container {
          position: relative;
          left: 440px;
          bottom: 60px;
          width: 900px;
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
          margin-bottom: -2rem;
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

export default EditListing;