import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Sidebar from "../components/Sidebar";

const Wishlist = () => {
  return (
    <>
    
      <Sidebar />
      <main className="wishlist-container">
        <h1>Wishlists</h1>
        <div className="wishlist-grid">
          <div className="no-wishlist-message">
            <FontAwesomeIcon icon={["fas", "heart"]} />
            <h2>Create your first wishlist</h2>
            <p>As you search, click the heart icon to save your favorite places...</p>
            <a href="/" className="cta-button">Start searching</a>
          </div>
        </div>
      </main>
    </>
  );
};

export default Wishlist;