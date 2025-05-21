import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer>
      <div className="footer-wrapper">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Support</h4>
            <div className="footer-links-row">
              <Link to="#">Help</Link>
              <Link to="#">Safety</Link>
              <Link to="#">Cancel</Link>
            </div>
          </div>
          <div className="footer-section">
            <h4>Community</h4>
            <div className="footer-links-row">
              <Link to="#">EasyTrip.org</Link>
              <Link to="#">Inclusion</Link>
            </div>
          </div>
          <div className="footer-section">
            <h4>Hosting</h4>
            <div className="footer-links-row">
              <Link to="#">Host</Link>
              <Link to="#">Resources</Link>
            </div>
          </div>
          <div className="footer-section contact">
            <h4>Contact</h4>
            <div className="contact-row">
              <span><FontAwesomeIcon icon={faPhone} /> +1 (555) 123-4567</span>
              <span><FontAwesomeIcon icon={faEnvelope} /> contact@easytrip.com</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {currentYear} EasyTrip <FontAwesomeIcon icon={faHeart} className="heart-icon" /></p>
          <div className="footer-links-row legal">
            <Link to="#">Privacy</Link>
            <Link to="#">Terms</Link>
            <Link to="#">Sitemap</Link>
          </div>
        </div>
      </div>

      <style>{`
        footer {
          background-color: var(--bg-light);
          padding: 0;
          margin-top: auto;
          width: 100%;
          font-size: 0.8rem;
        }
        
        .footer-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .footer-section h4 {
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: #333;
        }
        
        .footer-links-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        
        .footer-links-row a {
          color: #666;
          text-decoration: none;
          transition: color 0.2s;
          font-size: 0.8rem;
        }
        
        .footer-links-row a:hover {
          color: var(--primary-color);
        }
        
        .contact-row {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        
        .contact-row span {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.8rem;
          color: #666;
        }
        
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.75rem;
          font-size: 0.8rem;
        }
        
        .heart-icon {
          color: #ff385c;
          margin-left: 5px;
          font-size: 0.7rem;
        }
        
        .legal {
          gap: 1rem;
        }
        
        @media (max-width: 992px) {
          .footer-content {
            grid-template-columns: repeat(4, 1fr);
          }
          
          .footer-section {
            margin-bottom: 0;
          }
        }
        
        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem 1rem;
          }
        }
        
        @media (max-width: 576px) {
          .footer-wrapper {
            padding: 0.75rem;
          }
          
          .footer-content {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          
          .footer-bottom {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }
          
          .legal {
            justify-content: flex-start;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;