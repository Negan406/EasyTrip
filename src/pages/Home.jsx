import { useState, useEffect } from "react";
import ListingCard from "../components/ListingCard";
import { storeData } from "../store";

const Home = () => {
  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchListings = async () => {
      const newItems = Array.from({ length: 12 }, (_, i) => {
        const index = listings.length + i;
        const category = storeData.categories[index % storeData.categories.length];
        const title = storeData.titles[index % storeData.titles.length];
        const price = storeData.prices[index % storeData.prices.length];
        return {
          id: index + 1,
          category: category,
          title: title,
          price: price,
          rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(2)),
          distance: Math.floor(Math.random() * 10) + 1,
          dates: `May ${Math.floor(Math.random() * 20) + 1}-${Math.floor(Math.random() * 20) + 1}`
        };
      });
      setListings([...listings, ...newItems]);
    };

    fetchListings();
  }, [page]);

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