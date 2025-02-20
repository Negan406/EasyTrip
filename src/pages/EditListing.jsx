import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';

const EditListing = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(`Fetching listing with ID: ${id}`); // Debugging log
    const storedListings = JSON.parse(localStorage.getItem('listings')) || [];
    console.log('Stored Listings:', storedListings); // Debugging log
    const currentListing = storedListings.find((listing) => listing.id === parseInt(id));
    console.log('Current Listing:', currentListing); // Debugging log
    if (currentListing) {
      setListing(currentListing);
    } else {
      console.error('Listing not found');
      navigate('/manage-listings'); // Redirect if listing not found
    }
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setListing({ ...listing, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setListing({ ...listing, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const storedListings = JSON.parse(localStorage.getItem('listings')) || [];
    const updatedListings = storedListings.map((item) =>
      item.id === listing.id ? listing : item
    );
    localStorage.setItem('listings', JSON.stringify(updatedListings));
    navigate('/manage-listings');
  };

  if (!listing) return <div>Loading...</div>;

  return (
    <><br /><br />
    <div className="edit-listing-container">
      <h1>Edit Listing</h1>
      <form onSubmit={handleSubmit} className="listing-form">
        <input type="text" name="title" value={listing.title} onChange={handleInputChange} required />
        <input type="text" name="location" value={listing.location} onChange={handleInputChange} required />
        <input type="number" name="price" value={listing.price} onChange={handleInputChange} required />
        <input type="text" name="category" value={listing.category} onChange={handleInputChange} required />
        <textarea name="description" value={listing.description} onChange={handleInputChange} required />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {listing.photo && <img width={"100%"}  src={listing.photo} alt="Preview" className="image-preview" />}
        <button type="submit" className="cta-button">Save Changes</button>
      </form>
    </div>
    </>
  );
};

export default EditListing; 