import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { storeData } from "../store";

const ListingDetails = () => {
  const [listing, setListing] = useState(null);
  const { id } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      const index = parseInt(id, 14) -1 ;
      const title = storeData.titles[index % storeData.titles.length];
      const price = storeData.prices[index % storeData.prices.length];
      const category = storeData.categories[index % storeData.categories.length];
      const imageUrl = storeData.imgUrls[index % storeData.imgUrls.length+1];

      const data = {
        id: id,
        title: title,
        price: price,
        rating: 4.8,
        location: "Miami, FL",
        description: `Experience this stunning ${category} with breathtaking views and modern amenities.`,
        host: { name: "Sarah", avatar: "https://randomuser.me/api/portraits/women/42.jpg" },
        amenities: [
          { icon: "fas fa-wifi", text: "Fast wifi" },
          { icon: "fas fa-snowflake", text: "Air conditioning" },
          { icon: "fas fa-tv", text: "Smart TV" }
        ],
        imageUrl: imageUrl
      };
      setListing(data);
    };
    fetchListing();
  }, [id]);

  if (!listing) return <div className="loading-spinner" />;

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="listing-details-page">
        <div className="listing-gallery">
          <div className="main-image">
            <img src={listing.imageUrl} alt={listing.title} />
            <button className="favorite-large">
              <FontAwesomeIcon icon={["far", "heart"]} />
            </button>
          </div>
        </div>
        <div className="listing-content">
          <div className="listing-info-container">
            <div className="listing-header">
              <h1>{listing.title}</h1>
              <div className="listing-meta">
                <div className="rating-large">
                  <i className="fas fa-star"></i> {listing.rating}
                </div>
                <div className="location">
                  <i className="fas fa-map-marker-alt"></i>  {listing.location}
                </div>
              </div>
            </div>
            <div className="host-info">
              <img src={listing.host.avatar} alt={listing.host.name} className="host-avatar" />
              <div className="host-details">
                <h3>Hosted by {listing.host.name}</h3>
                <p>Superhost · Hosting since 2019</p>
              </div>
            </div>
            <div className="listing-description">
              <p>{listing.description}</p>
            </div>
            <div className="amenities">
              <h2>What this place offers</h2>
              <div className="amenities-grid">
                {listing.amenities.map((amenity, index) => (
                  <div key={index} className="amenity-item">
                    <FontAwesomeIcon icon={amenity.icon.split(" ")} />
                    <span>{amenity.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="booking-card">
            <div className="booking-price">
              <h2>$ {listing.price} <span className="per-night">night</span></h2>
            </div>
            <form className="booking-form">
              <div className="date-inputs">
                <input type="date" placeholder="Check-in" required />
                <input type="date" placeholder="Check-out" required />
              </div>
              <input type="number" min="1" max="16" placeholder="Guests" required />
              <button type="submit" className="book-button">Book now</button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
};

export default ListingDetails;