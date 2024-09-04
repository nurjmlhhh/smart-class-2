import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "../pages/profil.css";

export default function Profil() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const token = Cookies.get("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      try {
        const id = jwtDecode(token).id;
        fetch(`http://localhost:3000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("HTTP status " + response.status);
            }
            return response.json();
          })
          .then((data) => {
            setUser(data[0]);  
            setFormData({
              email: data[0].email,
              username: data[0].username,
              password: "",
            });
          })
          .catch((error) => {
            console.error("Error fetching user data:", error.message);
            navigate("/");
          });
      } catch (error) {
        console.error("Error decoding token:", error.message);
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (token) {
      const id = jwtDecode(token).id;
      fetch(`http://localhost:3000/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("HTTP status " + response.status);
          }
          return response.json();
        })
        .then(() => {
          setUser((prev) => ({ ...prev, ...formData }));
          setIsEditing(false);
          alert("Profil berhasil diperbarui!");
        })
        .catch((error) => {
          console.error("Error updating user:", error.message);
          alert("Terjadi kesalahan saat memperbarui profil: " + error.message);
        });
    }
  };

  const handleDelete = () => {
    if (token) {
      const id = jwtDecode(token).id;
      if (confirm("Apakah Anda yakin ingin menghapus akun ini?")) {
        fetch(`http://localhost:3000/api/users/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("HTTP status " + response.status);
            }
            alert("Akun berhasil dihapus.");
            Cookies.remove("token");
            navigate("/");
          })
          .catch((error) => {
            console.error("Error deleting user:", error.message);
            alert("Terjadi kesalahan saat menghapus akun: " + error.message);
          });
      }
    }
  };

  return (
    <div className="profil-container">
      {user ? (
        <div>
          <h1>Profil Pengguna</h1>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="profil-form">
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </label>
              <label>
                Username:
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </label>
              <label>
                Password:
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </label>
              <div className="form-buttons">
                <button type="submit">Simpan</button>
                <button type="button" onClick={() => setIsEditing(false)}>
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <div className="display-section">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Username:</strong> {user.username}</p>
              <div className="action-buttons">
                <button className="edit-button" onClick={() => setIsEditing(true)}>
                  Edit Profil
                </button>
                <button className="delete-button" onClick={handleDelete}>
                  Hapus Akun
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="loading-text">Loading...</p>
      )}
    </div>
  );
}
