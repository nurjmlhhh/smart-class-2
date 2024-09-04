import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import logoImage from "../assets/images/SmartClass.png"; // Sesuaikan path sesuai dengan direktori Anda
import "../componens/header.css";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("token");
    alert("Logged out successfully!");
    navigate("/");
  };

  return (
    <header className="bg-[#78B7D0] text-white shadow-lg py-4 fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <img src={logoImage} alt="SmartClass Logo" className="h-10 w-auto" />
          <Link
            to="/"
            className="text-3xl font-extrabold tracking-wide hover:text-white transition duration-300"
          >
            SmartClass
          </Link>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="flex space-x-8 text-lg">
            <li>
              <Link
                to="/home"
                className="hover:text-blue-200 transition duration-300"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/class"
                className="hover:text-blue-200 transition duration-300"
              >
                Class
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="hover:text-blue-200 transition duration-300"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/profil"
                className="hover:text-blue-200 transition duration-300"
              >
                Profil
              </Link>
            </li>
            <div>
              <button onClick={handleLogout}>
                Logout
              </button>
            </div>

            {/* <li>
              <div className="relative">
                <details className="profile-details absolute right-0 top-12 bg-white text-black rounded-lg shadow-md">
                  <summary className="cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <img
                        src="images/pic-1.jpg"
                        className="h-10 w-10 rounded-full object-cover"
                        alt="Profile"
                      />
                      <h3 className="name font-semibold">shaikh anas</h3>
                    </div>
                  </summary>
                  <div className="mt-3 p-4">
                    <p className="role text-gray-500">student</p>
                    <Link to="/profile" className="btn block text-blue-500 mt-2">
                      View Profile
                    </Link>
                    <div className="flex space-x-4 mt-4">
                      <Link
                        to="/login"
                        className="option-btn text-blue-500 hover:text-blue-700 transition"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="option-btn text-blue-500 hover:text-blue-700 transition"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                </details>
              </div>
            </li> */}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
