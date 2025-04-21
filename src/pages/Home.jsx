import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import ListingCard from "../components/ListingCard";
import { storeData } from "../store";
import LoadingSpinner from "../components/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faGlobe, 
  faUmbrellaBeach, 
  faCity, 
  faMountain, 
  faTree, 
  faWater, 
  faHouseChimney,
  faFire,
  faCampground,
  faSnowflake,
  faSun, // Changed from faDesert
  faAnchor, // Replace faIsland with faAnchor
  faUsers,
  faCalendarCheck,
  faExclamationTriangle,
  faChartLine,
  faDollarSign,
  faHouseUser,
  faClipboardList
} from "@fortawesome/free-solid-svg-icons";

const Home = ({ searchTerm }) => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [users, setUsers] = useState([]); // State to manage users
  const role = localStorage.getItem('role'); // Get role from localStorage
  const navigate = useNavigate();
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [clickedListingId, setClickedListingId] = useState(null);

  const navigateToUserManagement = () => {
    navigate('/manage-users'); // Navigate to the user management page
  };

  const navigateToOtherPage = () => {
    navigate('/other-page'); // Navigate to the other page
  };

  useEffect(() => {
    const fetchListings = () => {
      setLoading(true);
      const storedListings = JSON.parse(localStorage.getItem('listings')) || [];
      // Only show approved listings and ensure they have either mainPhoto or photo
      const approvedListings = storedListings.filter(listing => 
        (listing.status === 'approved' || !listing.status) && 
        (listing.mainPhoto || listing.photo)
      );
      setListings(approvedListings);
      setFilteredListings(approvedListings);
      setLoading(false);
    };

    fetchListings();
  }, []);

  useEffect(() => {
    if (role === 'admin') {
      const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
      setUsers(storedUsers);
    }
  }, [role]);

  useEffect(() => {
    const filtered = listings.filter(listing =>
      listing.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredListings(filtered);
  }, [searchTerm, listings]);

  const handleFilterClick = (category) => {
    setCategoryLoading(true);
    setSelectedCategory(category);
    // Simulate a small delay to show the loading spinner
    setTimeout(() => {
      setCategoryLoading(false);
    }, 500);
  };

  const handleDeleteUser = (userId) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const handleDeleteListing = (listingId) => {
    const updatedListings = listings.filter(listing => listing.id !== listingId);
    setListings(updatedListings);
    setFilteredListings(updatedListings);
    localStorage.setItem('listings', JSON.stringify(updatedListings));
  };

  const handleDeleteClick = (listingId) => {
    if (!isLoggedIn || role !== 'admin') {
      alert('You must be logged in as an admin to delete listings');
      navigate('/login');
      return;
    }
    setDeleteConfirmation(listingId);
  };

  const handleConfirmDelete = async (listingId) => {
    setDeleteLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedListings = listings.filter(listing => listing.id !== listingId);
      setListings(updatedListings);
      setFilteredListings(updatedListings);
      localStorage.setItem('listings', JSON.stringify(updatedListings));
      setShowSuccessMsg(true);
      setTimeout(() => setShowSuccessMsg(false), 3000);
    } catch (error) {
      console.error('Error deleting listing:', error);
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmation(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleListingClick = (listingId) => {
    setClickedListingId(listingId);
    // Simulate loading time before navigation
    setTimeout(() => {
      navigate(`/listing/${listingId}`);
    }, 500);
  };

  const categoryFilteredListings = filteredListings.filter(
    listing => selectedCategory === "all" || listing.category === selectedCategory
  );

  const categoryIcons = {
    "all": faGlobe,
    "beach-houses": faUmbrellaBeach,
    "city-apartments": faCity,
    "mountain-cabins": faMountain,
    "forest-lodges": faTree,
    "lakefront-properties": faWater,
    "luxury-villas": faHouseChimney,
    "trending": faFire,
    "camping": faCampground,
    "arctic": faSnowflake,
    "desert": faSun, // Changed from faDesert
    "islands": faAnchor // Replace faIsland with faAnchor
  };

  return (
    <main>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {showSuccessMsg && (
            <div className="success-message" data-aos="fade-down">
              Listing deleted successfully!
            </div>
          )}
          {role === 'admin' && (
            <div className="admin-panel">
              <ul>
                {users.map(user => (
                  <li key={user.id}>
                    {user.email}
                    <button className="delete-button" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="filters" data-aos="fade-down">
            <button
              className={`filter-button ${selectedCategory === "all" ? "active" : ""}`}
              onClick={() => handleFilterClick("all")}
            >
              <FontAwesomeIcon icon={categoryIcons["all"]} /> All
            </button>
            {storeData.categories.map((category) => (
              <button
                key={category}
                className={`filter-button ${selectedCategory === category ? "active" : ""}`}
                onClick={() => handleFilterClick(category)}
              >
                <FontAwesomeIcon icon={categoryIcons[category] || faGlobe} />
                {" "}
                {category.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
              </button>
            ))}
          </div>
          <div className="listings">
            {categoryLoading ? (
              <LoadingSpinner />
            ) : categoryFilteredListings.length === 0 ? (
              <div className="no-results" data-aos="fade-up">
                <p>There is no list that contains this category.</p>
              </div>
            ) : (
              categoryFilteredListings.map((listing, index) => (
                <div 
                  key={listing.id} 
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className={`listing-wrapper ${clickedListingId === listing.id ? 'loading' : ''}`}
                  onClick={() => handleListingClick(listing.id)}
                >
                  <ListingCard listing={listing} />
                  {isLoggedIn && role === 'admin' && (
                    <button 
                      className={`delete-button ${deleteLoading && deleteConfirmation === listing.id ? 'delete-loading' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(listing.id);
                      }}
                      disabled={deleteLoading}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {deleteConfirmation && (
            <>
              <div className="modal-overlay" />
              <div className="delete-confirmation-modal">
                <h3>Confirm Deletion</h3>
                <p>Are you sure you want to delete this listing?</p>
                <div className="confirmation-buttons">
                  <button 
                    className="cancel-delete"
                    onClick={handleCancelDelete}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="confirm-delete"
                    onClick={() => handleConfirmDelete(deleteConfirmation)}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <style jsx>{`
        // ...existing styles...
        
        .filter-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          // ...rest of existing button styles...
        }

        .filter-button svg {
          width: 16px;
          height: 16px;
        }

        .listings {
          opacity: 1;
          transition: opacity 0.3s ease-in-out;
        }

        .listings > div {
          transition: transform 0.3s ease-in-out;
        }

        .listings > div:hover {
          transform: translateY(-5px);
        }

        .success-message {
          background-color: #4CAF50;
          color: white;
          padding: 10px;
          border-radius: 4px;
          margin: 10px auto;
          max-width: 300px;
          text-align: center;
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
        }

        .listing-wrapper {
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .listing-wrapper.loading::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 12px;
        }

        .listing-wrapper.loading::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 30px;
          height: 30px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid var(--primary-color);
          border-radius: 50%;
          z-index: 1;
          animation: spin 1s linear infinite;
          pointer-events: none;
        }

        @keyframes spin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </main>
  );
};

export default Home;