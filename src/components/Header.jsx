import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faBars, faUserCircle, faSearch, faHome, faSuitcase, faHeart, faUser, faSignInAlt, faUserPlus, faUsers, faHouseUser } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate, Link } from "react-router-dom";
import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
import s from  "../components/unnamed.png";

const Header = ({ onSearch }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; // Check login state
  const [searchTerm, setSearchTerm] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const role = localStorage.getItem('role') || 'user';
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const countries = [
    'All',
    'United States',
    'Canada',
    'United Kingdom',
    'France',
    'Germany',
    'Spain',
    'Italy',
    'Japan',
    // Add more countries as needed
  ];

  const handleBecomeHostClick = () => {
    navigate(location.pathname === "/become-host" ? "/" : "/become-host");
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Add 1 second delay
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('role');
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    // You can add your filtering logic here
  };

  return (
    <header>
      <nav>
        <div className="logo" onClick={() => navigate("/")}>
            <img src={s} alt="" className="lg"  width={40}/><strong className="esy">EasyTrip</strong>
        </div>
        <div style={{width: '60%',height: '40px'}} className="search-bar">
          <input style={{borderRadius: '10px',padding: '10px',width: '100%',border: 'none',outline: 'none'}}
            type="text"
            placeholder="Search by location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
        <div className="nav-right">
          <button  className="become-host-button" onClick={handleBecomeHostClick}>
            {location.pathname === "/become-host" ? "Switch to traveling" : "Become a host"}
          </button>
          <div className="country-selector">
            <button onClick={() => setShowCountryDropdown(!showCountryDropdown)}>
              <FontAwesomeIcon icon={faGlobe} />
            </button>
            {showCountryDropdown && (
              <div className="country-dropdown">
                {countries.map((country) => (
                  <div
                    key={country}
                    className={`country-option ${selectedCountry === country ? 'selected' : ''}`}
                    onClick={() => handleCountrySelect(country)}
                  >
                    {country}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="profile-menu-container" ref={dropdownRef}>
            <div className="profile-menu" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <FontAwesomeIcon icon={faBars} />
              <FontAwesomeIcon icon={faUserCircle} />
            </div>
            {showProfileMenu && (
              <div className="profile-dropdown">
                <Link to="/" className="dropdown-item">
                  <FontAwesomeIcon icon={faHome} /> Home
                </Link>
                {isLoggedIn ? (
                  <>
                    <Link to="/trips" className="dropdown-item">
                      <FontAwesomeIcon icon={faSuitcase} /> Trips
                    </Link>
                    <Link to="/wishlist" className="dropdown-item">
                      <FontAwesomeIcon icon={faHeart} /> Wishlists
                    </Link>
                    <div className="dropdown-divider"></div>
                    <Link to="/become-host" className="dropdown-item">
                      <FontAwesomeIcon icon={faHouseUser} /> Become a Host
                    </Link>
                    <Link to="/account-settings" className="dropdown-item">
                      <FontAwesomeIcon icon={faUser} /> Account
                    </Link>
                    {role === 'admin' && (
                      <Link to="/manage-users" className="dropdown-item">
                        <FontAwesomeIcon icon={faUsers} /> Manage Users
                      </Link>
                    )}
                    
                    <button 
                      onClick={handleLogout} 
                      className="dropdown-item logout-item"
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        "Loading..."
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-box-arrow-in-left" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M10 3.5a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 1 1 0v2A1.5 1.5 0 0 1 9.5 14h-8A1.5 1.5 0 0 1 0 12.5v-9A1.5 1.5 0 0 1 1.5 2h8A1.5 1.5 0 0 1 11 3.5v2a.5.5 0 0 1-1 0z"/>
                            <path fillRule="evenodd" d="M4.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H14.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708z"/>
                          </svg> Logout
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="dropdown-item">
                      <FontAwesomeIcon icon={faSignInAlt} /> Login
                    </Link>
                    <Link to="/register" className="dropdown-item">
                      <FontAwesomeIcon icon={faUserPlus} /> Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <style jsx>{`
        .country-selector {
          position: relative;
        }
        
        .country-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 1000;
          min-width: 200px;
        }

        .country-option {
          padding: 10px 15px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .country-option:hover {
          background-color: #f5f5f5;
        }

        .country-option.selected {
          background-color: #e6e6e6;
        }

        .profile-menu-container {
          position: relative;
        }

        .profile-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          min-width: 200px;
          z-index: 1000;
          padding: 8px 0;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          color: #333;
          text-decoration: none;
          transition: background-color 0.2s;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }

        .dropdown-item:hover {
          background-color: #f5f5f5;
        }

        .dropdown-divider {
          height: 1px;
          background-color: #eee;
          margin: 8px 0;
        }

        .logout-item {
          color: #ff0000;
        }

        .logout-item:disabled {
          opacity: 0.7;
          cursor: wait;
          background-color: #ffecec;
        }
      `}</style>
    </header>
  );
};

Header.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default Header;