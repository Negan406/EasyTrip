import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faHome, faSuitcase, faHeart, faUser, faSignInAlt, faUserPlus, faUsers, faHouseUser, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import PropTypes from 'prop-types';

const Sidebar = ({ isOpen, onClose }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const role = localStorage.getItem('role');

  return (
    <div className={`sidebar ${isOpen ? "active" : ""}`}>
      <div className="sidebar-header">
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <button className="hide-sidebar-button" onClick={onClose}>
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <div className="sidebar-content">
        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <Link to="/" onClick={onClose}>
              <FontAwesomeIcon icon={faHome} /> Home
            </Link>
          </li>
          {isLoggedIn && (
            <>
              <li className="sidebar-item">
                <Link to="/trips" onClick={onClose}>
                  <FontAwesomeIcon icon={faSuitcase} /> Trips
                </Link>
              </li>
              <li className="sidebar-item">
                <Link to="/wishlist" onClick={onClose}>
                  <FontAwesomeIcon icon={faHeart} /> Wishlists
                </Link>
              </li>
            </>
          )}
          <hr className="divider" />
          <li className="sidebar-item">
            <Link to="/become-host" onClick={onClose}>
              <FontAwesomeIcon icon={faHouseUser} /> Become a Host
            </Link>
          </li>
          {isLoggedIn && (
            <li className="sidebar-item">
              <Link to="/account-settings" onClick={onClose}>
                <FontAwesomeIcon icon={faUser} /> Account
              </Link>
            </li>
          )}
          {isLoggedIn && role === 'admin' && (
            <>
              <li className="sidebar-item">
                <Link to="/manage-users" onClick={onClose}>
                  <FontAwesomeIcon icon={faUsers} /> Manage Users
                </Link>
              </li>
            </>
          )}
          {!isLoggedIn && (
            <>
              <li className="sidebar-item">
                <Link to="/login" onClick={onClose}>
                  <FontAwesomeIcon icon={faSignInAlt} /> Login
                </Link>
              </li>
              <li className="sidebar-item">
                <Link to="/register" onClick={onClose}>
                  <FontAwesomeIcon icon={faUserPlus} /> Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Sidebar;