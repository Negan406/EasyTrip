import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import ListingCard from "../components/ListingCard";
import { storeData } from "../store";
import LoadingSpinner from "../components/LoadingSpinner";

const Home = ({ searchTerm }) => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = () => {
      setLoading(true);
      const storedListings = JSON.parse(localStorage.getItem('listings')) || [];
      setListings(storedListings);
      setFilteredListings(storedListings);
      setLoading(false);
    };

    fetchListings();
  }, []);

  useEffect(() => {
    const filtered = listings.filter(listing =>
      listing.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredListings(filtered);
  }, [searchTerm, listings]);

  const handleFilterClick = (category) => {
    setSelectedCategory(category);
  };

  const categoryFilteredListings = filteredListings.filter(
    listing => selectedCategory === "all" || listing.category === selectedCategory
  );

  return (
    <main>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="filters">
            <button
              className={`filter-button ${selectedCategory === "all" ? "active" : ""}`}
              onClick={() => handleFilterClick("all")}
            >
              All
            </button>
            {storeData.categories.map((category) => (
              <button
                key={category}
                className={`filter-button ${selectedCategory === category ? "active" : ""}`}
                onClick={() => handleFilterClick(category)}
              >
                {category.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
              </button>
            ))}
          </div>
          <div className="listings">
            {categoryFilteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </>
      )}
    </main>
  );
};

export default Home;