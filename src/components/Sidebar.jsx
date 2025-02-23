import { Link, NavLink } from "react-router-dom";
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
          <NavLink to="/" exact="true" activeClassName="active" onClick={onClose}>
            <i className="fas fa-home"></i> Home
          </NavLink>
          {isLoggedIn && (
            <NavLink to="/trips" activeClassName="active" onClick={onClose}>
              <i className="fas fa-suitcase"></i> Trips
            </NavLink>
          )}
          {isLoggedIn && (
            <NavLink to="/wishlist" activeClassName="active" onClick={onClose}>
              <i className="fas fa-heart"></i> Wishlists
            </NavLink>
          )}
          <hr />
          <NavLink to="/become-host" activeClassName="active" onClick={onClose}>
            <FontAwesomeIcon icon={["fas", "house-user"]} /> Become a Host
          </NavLink>
          {isLoggedIn && (
            <NavLink to="/account-settings" activeClassName="active" onClick={onClose}>
              <FontAwesomeIcon icon={["fas", "user"]} /> Account
            </NavLink>
          )}
          {!isLoggedIn && (
            <>
              <NavLink to="/login" activeClassName="active" onClick={onClose}>
                <FontAwesomeIcon icon={["fas", "sign-in-alt"]} /> Login
              </NavLink>
              <NavLink to="/register" activeClassName="active" onClick={onClose}>
                <FontAwesomeIcon icon={["fas", "user-plus"]} /> Register
              </NavLink>
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