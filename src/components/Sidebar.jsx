import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import PropTypes from 'prop-types';

const Sidebar = ({ isOpen, onClose }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  return (
    <div className={`sidebar ${isOpen ? "active" : ""}`}>
      <div className="sidebar-header">
        <button onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="sidebar-content">
        <div className="sidebar-menu">
          <Link to="/" onClick={onClose} activeClassName="active">
            <i className="fas fa-home"></i> Home
          </Link>
          <Link to="/trips" onClick={onClose} activeClassName="active">
            <i className="fas fa-suitcase"></i> Trips
          </Link>
          {isLoggedIn && (
            <Link to="/wishlist" onClick={onClose} activeClassName="active">
              <i className="fas fa-heart"></i> Wishlists
            </Link>
          )}
          <hr />
          <Link to="/become-host" onClick={onClose} activeClassName="active">
            <FontAwesomeIcon icon={["fas", "house-user"]} /> Become a Host
          </Link>
          {isLoggedIn && (
            <Link to="/account-settings" onClick={onClose} activeClassName="active">
              <FontAwesomeIcon icon={["fas", "user"]} /> Account
            </Link>
          )}
          {!isLoggedIn && (
            <>
              <Link to="/login" onClick={onClose} activeClassName="active">
                <FontAwesomeIcon icon={["fas", "sign-in-alt"]} /> Login
              </Link>
              <Link to="/register" onClick={onClose} activeClassName="active">
                <FontAwesomeIcon icon={["fas", "user-plus"]} /> Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Sidebar;