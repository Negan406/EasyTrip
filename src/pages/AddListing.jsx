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
    photo: null 
  });
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewListing({ ...newListing, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewListing({ ...newListing, photo: reader.result });
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
      photo: newListing.photo
    };

    try {
      const listings = JSON.parse(localStorage.getItem('listings')) || [];
      listings.push(listing);
      localStorage.setItem('listings', JSON.stringify(listings));
      setTimeout(() => {
        setLoading(false);
        navigate('/');
      }, 2000);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        alert('Storage limit exceeded. Please clear some data.');
      } else {
        console.error('Failed to add listing:', error);
      }
    }
  };

  return (
    <> <br /><br />
    <div className="add-listing-container">
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <h1>Add New Listing</h1>
          <form onSubmit={handleSubmit} className="listing-form">
            <input type="text" name="title" placeholder="Title" value={newListing.title} onChange={handleInputChange} required />
            <input type="text" name="location" placeholder="Location" value={newListing.location} onChange={handleInputChange} required />
            <input type="number" name="price" placeholder="Price" value={newListing.price} onChange={handleInputChange} required />
            <input type="text" name="category" placeholder="Category" value={newListing.category} onChange={handleInputChange} required />
            <textarea name="description" placeholder="Description" value={newListing.description} onChange={handleInputChange} required />
            <input type="file" accept="image/*" onChange={handleFileChange} required />
            {preview && <img src={preview} alt="Preview" className="image-preview" />}
            <button type="submit" className="cta-button">Add Listing</button>
          </form>
        </>
      )}
    </div>
    </>
  );
};

export default AddListing; 