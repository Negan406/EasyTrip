import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Sidebar from "../components/Sidebar";
import ListingCard from "../components/ListingCard";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlist(storedWishlist);
  }, []);

  const handleRemoveFromWishlist = (id) => {
    const updatedWishlist = wishlist.filter(listing => listing.id !== id);
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  return (
    <>
      <Sidebar />
      <main className="wishlist-container">
        <h1><i className="fas fa-heart"></i> Wishlists</h1>
        <div className="wishlist-grid">
          {wishlist.length > 0 ? (
            wishlist.map((listing) => (
              <div key={listing.id} className="wishlist-item">
                <ListingCard listing={listing} />
                <button
                  className="remove-button"
                  onClick={() => handleRemoveFromWishlist(listing.id)}
                >
                  Remove from Wishlist
                </button>
              </div>
            ))
          ) : (
            <div className="no-wishlist-message">
              <FontAwesomeIcon icon={["fas", "heart"]} />
              <h2>Create your first wishlist</h2>
              <p>As you search, click the heart icon to save your favorite places...</p>
              <a href="/" className="cta-button">Start searching</a>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Wishlist;