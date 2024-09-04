import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa'; 
import "../pages/style2.css";
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        {/* Social Media Icons */}
        <div className="social-icons">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebookF />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <FaTwitter />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <FaLinkedinIn />
          </a>
          <a href="https://www.instagram.com/nr_jmlhhh/" target="_blank" rel="noopener noreferrer">
            <FaInstagram />
          </a>
        </div>

        <div className="bottom-text">
          <p>&copy; {new Date().getFullYear()} SmartClass. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
