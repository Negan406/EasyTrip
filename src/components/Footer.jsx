const Footer = () => {
    return (
      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Safety information</a></li>
              <li><a href="#">Cancellation options</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Community</h4>
            <ul>
              <li><a href="#">EasyTrip.org</a></li>
              <li><a href="#">Combating discrimination</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Hosting</h4>
            <ul>
              <li><a href="#">Try hosting</a></li>
              <li><a href="#">Visit our community forum</a></li>
              <li><a href="#">How to host responsibly</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2023 EasyTrip, Inc.</p>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;