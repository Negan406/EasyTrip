import { useState } from "react";
import { useNavigate } from 'react-router-dom';

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewListing({ ...newListing, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewListing({ ...newListing, photo: file });

    
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const listings = JSON.parse(localStorage.getItem('listings')) || [];
    const newId = listings.length > 0 ? listings[listings.length - 1].id + 1 : 1; 
    listings.push({ ...newListing, id: newId, photo: preview }); 
    localStorage.setItem('listings', JSON.stringify(listings));
    navigate('/'); // Redirect to Home page
  };

  return (
    <> <br /><br />
    <div className="add-listing-container">
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
    </div>
    </>
  );
};

export default AddListing; 