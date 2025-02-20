import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faBars, faUserCircle, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';

const Header = ({ onSidebarToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; // Check login state

  const handleBecomeHostClick = () => {
    navigate(location.pathname === "/become-host" ? "/" : "/become-host");
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn'); // Clear login state
    navigate('/login'); // Redirect to Login page
  };

  return (
    <header>
      <nav>
        <div className="logo" onClick={() => navigate("/")}>
          <svg className="logo-svg" width="120" height="40" viewBox="0 0 120 40">
            <path d="M10,20 Q15,10 20,20 T30,20" fill="none" stroke="#0098f0" strokeWidth="3"/>
            <text x="35" y="25" fontFamily="Arial" fontSize="20" fontWeight="bold" fill="#0098f0">EasyTrip</text>
          </svg>
        </div>
        <div className="search-bar">
          <button>Anywhere</button>
          <span className="separator" />
          <button>Any week</button>
          <span className="separator" />
          <button>Add guests</button>
          <button className="search-button">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
        <div className="nav-right">
          <button className="become-host-button" onClick={handleBecomeHostClick}>
            {location.pathname === "/become-host" ? "Switch to traveling" : "Become a host"}
          </button>
          <button>
            <FontAwesomeIcon icon={faGlobe} />
          </button>
          <div className="profile-menu" onClick={onSidebarToggle}>
            <FontAwesomeIcon icon={faBars} />
            <FontAwesomeIcon icon={faUserCircle} />
          </div>
          {isLoggedIn && (
            <button style={{backgroundColor: "red", color: "white"}} className="cta-button logout-button" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

Header.propTypes = {
  onSidebarToggle: PropTypes.func.isRequired,
};

export default Header;