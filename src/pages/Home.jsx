import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import ListingCard from "../components/ListingCard";
import { storeData } from "../store";

const Home = () => {
  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = () => {
      const storedListings = JSON.parse(localStorage.getItem('listings')) || [];
      setListings(storedListings);
    };

    fetchListings();
  }, []);

  const handleFilterClick = (category) => {
    setSelectedCategory(category);
  };

  const filteredListings = listings.filter(
    listing => selectedCategory === "all" || listing.category === selectedCategory
  );

  return (
    <main>
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
        {filteredListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
        <button className="cta-button" onClick={() => setPage(page + 1)}>
          Load More
        </button>
      </div>
    </main>
  );
};

export default Home;