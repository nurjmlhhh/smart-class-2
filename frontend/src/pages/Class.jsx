import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { PlusCircle, Search, MessageCircleX, FilePenLine } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "../pages/class.css";

export default function Class() {
  const [clas, setClas] = useState([]);
  const [updateclas, setUpdateclas] = useState(null);
  const [newclas, setNewclas] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const sortBy = "id";
  const [search, setSearch] = useState("");

  const token = Cookies.get("token");
  const [idTeacher, setIdTeacher] = useState(
    Cookies.get("token") && jwtDecode(Cookies.get("token")).id
  );

  useEffect(() => {
    setIdTeacher(Cookies.get("token") && jwtDecode(Cookies.get("token")).id);
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/class/${idTeacher}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();
        setClas(data);
      } catch (error) {
        console.error("Error fetching classes:", error.message);
      }
    };

    fetchClasses();
  }, [idTeacher, token]);

  const handleAddNewclas = async () => {
    const classData = { ...newclas, id_teacher: idTeacher };
    try {
      const response = await fetch(`http://localhost:3000/api/class`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(classData),
      });

      if (!response.ok) {
        throw new Error(`Gagal menambah kelas, status: ${response.status}`);
      }

      const addedClass = await response.json();
      setClas([...clas, addedClass]);
      setNewclas({ name: "", kode: "" });
    } catch (error) {
      console.error("Error adding class:", error.message);
      alert("Anda belum login, silahkan login terlebih dahulu");
      navigate("/login");
    }
  };

  function handleDelete(id) {
    if (confirm("Apakah anda yakin ingin menghapus data ini?")) {
      fetch(`http://localhost:3000/api/class/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.text())
        .then((message) => {
          setClas((prev) => prev.filter((item) => item.id !== id));
          alert(message);
        })
        .catch((error) => {
          console.error("Error:", error.message);
          alert("Terjadi kesalahan saat menghapus data class");
        });
    }
  }

  function saveUpdate() {
    fetch(`http://localhost:3000/api/class/${updateclas.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateclas),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP status " + response.status);
        }
        return response.json();
      })
      .then(() => {
        setClas((prev) =>
          prev.map((item) =>
            item.id === updateclas.id ? { ...item, ...updateclas } : item
          )
        );
        setUpdateclas(null);
        alert("Data berhasil diperbarui!");
      })
      .catch((error) => {
        console.error("Error:", error.message);
        alert("Terjadi kesalahan saat memperbarui data class" + error.message);
      });
  }

  const filterData = clas
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortBy] < b[sortBy] ? -1 : 1;
      } else {
        return a[sortBy] > b[sortBy] ? -1 : 1;
      }
    })
    .filter((item) => {
      return item.name.toLowerCase().includes(search.toLowerCase());
    });

  return (
    <div className="dashboard-container">
      <div className="header">
        <button
          className="add-button"
          onClick={() => setNewclas({ name: "", kode: "" })}
        >
          <PlusCircle />
        </button>
        <div className="search-container">
          <Search />
          <input
            type="text"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classes..."
          />
        </div>
        <button
          className="sort-button"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          Sort by {sortOrder === "asc" ? "Descending" : "Ascending"}
        </button>
      </div>

      <div className="class-grid">
        {filterData.map((clas) => (
          <div
            key={clas.id}
            className="class-card"
            onClick={() => navigate(`/post/${clas.id}`)}
          >
            <h2 className="class-name">{clas.name}</h2>
            <p className="class-code">Kode: {clas.kode}</p>
            <div className="card-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(clas.id);
                }}
                className="delete-button"
              >
                <MessageCircleX />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUpdateclas(clas);
                }}
                className="edit-button"
              >
                <FilePenLine />
              </button>
            </div>
          </div>
        ))}
      </div>

      {newclas && (
        <div className="overlay">
          <div className="form-container">
            <button className="close-button" onClick={() => setNewclas(null)}>
              ✖
            </button>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddNewclas();
              }}
              className="form"
            >
              <h3 className="form-title">Add New Class</h3>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Class Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newclas.name}
                  onChange={(e) =>
                    setNewclas({ ...newclas, name: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="kode" className="form-label">
                  Class Code
                </label>
                <input
                  type="text"
                  id="kode"
                  value={newclas.kode}
                  onChange={(e) =>
                    setNewclas({ ...newclas, kode: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setNewclas(null)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {updateclas && (
        <div className="overlay">
          <div className="form-container">
            <button
              className="close-button"
              onClick={() => setUpdateclas(null)}
            >
              ✖
            </button>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveUpdate();
              }}
              className="form"
            >
              <h3 className="form-title">Update Class</h3>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Class Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={updateclas.name}
                  onChange={(e) =>
                    setUpdateclas({ ...updateclas, name: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="kode" className="form-label">
                  Class Code
                </label>
                <input
                  type="text"
                  id="kode"
                  value={updateclas.kode}
                  onChange={(e) =>
                    setUpdateclas({ ...updateclas, kode: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setUpdateclas(null)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}