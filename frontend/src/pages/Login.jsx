import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        alert("Login berhasil");

        Cookies.set("token", result.token, { expires: 1 });
        console.log(Cookies.get("token"));

        const decodedToken = jwtDecode(result.token || null);
        console.log("Decoded Token:", decodedToken);

        navigate("/home");
      } else {
        const errorText = await response.text();
        alert(`Error: ${errorText}`);
      }
    } catch (error) {
      console.error("Terjadi kesalahan!", error);
      alert("Terjadi kesalahan saat login.");
    }
  };

  return (
    <div className="login-container cont">
      <div className="login-form-container">
        <div className="light-effect"></div>
        <div className="login-form">
          <h2 className="login-title">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Username"
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Password"
              />
            </div>
            <button type="submit" className="submit-button">
              Login
            </button>
          </form>
          <div className="register-link">
            <p>
              Belum punya akun?
              <span onClick={() => navigate(`/register`)}> Daftar di sini</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
