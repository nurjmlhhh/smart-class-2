import { pool } from "../database.js";
import express from "express";
import cors from 'cors';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';


const app = express();
app.use(express.json()); //memparsing JSON request body
app.use(
    cors({
        origin: ["http://localhost:5173"],
        credentials: true
    })
);

// Endpoint untuk Registrasi
app.post("/api/register", async (req, res) => {
    try {
        const hash = await argon2.hash(req.body.password);
        const result = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
            [req.body.username, req.body.email, hash]
        );

        const user = result.rows[0];

        // Generate JWT token
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.SECRET_KEY, {
            expiresIn: '1h', 
        });

        // Set token as HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 60 * 60 * 1000, 
            sameSite: 'strict', 
        });

        res.status(201).send("Registrasi berhasil");
    } catch (error) {
        console.error(error);
        res.status(500).send(`Terjadi kesalahan saat registrasi: ${error.message}`);
    }
});


// Middleware untuk Autentikasi Token
function authenticateToken(req, res, next) {
    const authorization = req.headers.authorization;
    if (authorization && authorization.startsWith("Bearer ")) {
      const token = authorization.split(" ")[1];
      try {
        req.user = jwt.verify(token, process.env.SECRET_KEY);
        next();
      } catch (error) {
        res.status(401).send("Token tidak valid.");
      }
    } else {
      res.status(401).send("Anda belum login (tidak ada otorisasi).");
    }
}



// Endpoint untuk Login
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Cari pengguna berdasarkan username
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

        if (result.rows.length > 0) {
            const user = result.rows[0];

            // Verifikasi kata sandi
            if (await argon2.verify(user.password, password)) {
                // Buat token JWT tanpa 'role', karena role telah dihapus
                const token = jwt.sign(
                    { id: user.id, username: user.username }, 
                    process.env.SECRET_KEY, 
                    { expiresIn: '1h' }
                );

                // Kirimkan token dan pesan sukses
                res.json({
                    token,
                    message: "Login berhasil",
                });
            } else {
                // Jika kata sandi salah
                res.status(401).send("Kata sandi salah");
            }
        } else {
            // Jika pengguna tidak ditemukan
            res.status(404).send(`Pengguna dengan nama ${username} tidak ditemukan`);
        }
    } catch (error) {
        // Tangani kesalahan yang mungkin terjadi
        console.error('Terjadi kesalahan!', error);
        res.status(500).send("Terjadi kesalahan saat login.");
    }
});


//---------------------------------MANIPULASI USERS---------------------------------
app.get("/api/users/:id", authenticateToken, async (req, res) => {
    const result = await pool.query("SELECT * FROM users where id=$1", [req.params.id]);
    res.json(result.rows);
});

app.put("/api/users/:id", authenticateToken, async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const { id } = req.params;

        console.log("Update request for user ID:", id);
        console.log("Data to update:", { email, username, password });

        await pool.query(
            "UPDATE users SET email = $1, username = $2, password = $3 WHERE id = $4",
            [email, username, password, id]
        );

        res.status(200).json({ message: "User berhasil diupdate" });
    } catch (error) {
        console.error("Error updating user:", error.message);
        res.status(500).json({ error: "Gagal memperbarui user" });
    }
});


app.delete("/api/users/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        console.log("Delete request for user ID:", id);

        await pool.query("DELETE FROM task WHERE id_class IN (SELECT id FROM class WHERE id_teacher = $1)", [id]);
        await pool.query("DELETE FROM post WHERE id_class IN (SELECT id FROM class WHERE id_teacher = $1)", [id]);
        await pool.query("DELETE FROM class WHERE id_teacher = $1", [id]);

        await pool.query("DELETE FROM users WHERE id = $1", [id]);

        res.status(200).json({ message: "User dan data terkait berhasil dihapus" });
    } catch (error) {
        console.error("Error deleting user:", error.message);
        res.status(500).json({ error: "Gagal menghapus user" });
    }
});




//---------------------------------MANIPULASI CLASS---------------------------------


app.post("/api/class", authenticateToken, async (req, res) => {
    const { name, kode, id_teacher } = req.body;
    const idTeacher = id_teacher; // Mengambil id_teacher dari token JWT

    try {
        const result = await pool.query(
            "INSERT INTO class (name, kode, id_teacher) VALUES ($1, $2, $3) RETURNING *",
            [name, kode, idTeacher]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting class:', error);
        res.status(500).send("Terjadi kesalahan saat menambahkan kelas.");
    }
});

app.get("/api/class/:id", authenticateToken, async (req, res) => {
    const result = await pool.query("SELECT * FROM class where id_teacher=$1", [req.params.id]);
    res.json(result.rows);
});



app.put("/api/class/:id", authenticateToken, async (req, res) => {
    try {
        const { name, kode } = req.body;
        const { id } = req.params;

        await pool.query(
            "UPDATE class SET name = $1, kode = $2 WHERE id = $3",
            [name, kode, id]
        );

        res.status(200).json({ message: "Class berhasil diupdate" });
    } catch (error) {
        console.error("Error updating class:", error.message);
        res.status(500).json({ error: "Gagal memperbarui class" });
    }
});




app.delete("/api/class/:id", authenticateToken, async (req, res) => {
    const client = await pool.connect(); // Menggunakan client untuk transaksi

    try {
        const { id } = req.params;

        await client.query("BEGIN"); // Memulai transaksi

        // Hapus semua tasks yang terkait dengan kelas
        await client.query("DELETE FROM task WHERE id_class = $1", [id]);

        // Hapus semua posts yang terkait dengan kelas
        await client.query("DELETE FROM post WHERE id_class = $1", [id]);

        // Hapus kelas itu sendiri
        await client.query("DELETE FROM class WHERE id = $1", [id]);

        await client.query("COMMIT"); // Commit transaksi jika semua berhasil

        res.status(200).json({ message: "Class dan semua data terkait berhasil dihapus" });
    } catch (error) {
        await client.query("ROLLBACK"); // Rollback transaksi jika terjadi error
        console.error("Error deleting class and related data:", error.message);
        res.status(500).json({ error: "Gagal menghapus class dan data terkait" });
    } finally {
        client.release(); // Pastikan client dirilis setelah transaksi selesai
    }
});

//---------------------------------MANIPULASI Post---------------------------------

  app.post("/api/post", authenticateToken ,async (req, res) => {
    const { deskripsi, id_class } = req.body;
    const idClass = id_class; // Mengambil id_teacher dari token JWT

    try {
        const result = await pool.query(
            "INSERT INTO post (deskripsi, id_class) VALUES ($1, $2) RETURNING *",
            [deskripsi, idClass]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting post:', error);
        res.status(500).send("Terjadi kesalahan saat menambahkan kelas.");
    }
});


app.get("/api/posts/:id", authenticateToken,async (req, res) => {
    const result = await pool.query("SELECT * FROM post where id_class=$1", [req.params.id]);
    res.json(result.rows);
});

app.put("/api/post/:id", authenticateToken, async (req, res) => {
    await pool.query(
        "UPDATE post SET deskripsi = $1 WHERE id = $2",
        [req.body.deskripsi, req.params.id]
    );
    res.json("post berhasil di update");
});


app.delete("/api/post/:id", authenticateToken, async (req, res) => {
    await pool.query("DELETE FROM post WHERE id = $1", [req.params.id]);
    res.send("post berhasil dihapus");
  });
  

//---------------------------------MANIPULASI TASK---------------------------------

app.post("/api/task", authenticateToken ,async (req, res) => {
    const { title, deskripsi, deadline, id_class } = req.body;
    const idClass = id_class; // Mengambil id_teacher dari token JWT

    try {
        const result = await pool.query(
            "INSERT INTO task (title, deskripsi, deadline, id_class) VALUES ($1, $2, $3, $4) RETURNING *",
            [title, deskripsi, deadline, idClass]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting post:', error);
        res.status(500).send("Terjadi kesalahan saat menambahkan kelas.");
    }
});


app.get("/api/task/:id", async (req, res) => {
    const result = await pool.query("SELECT * FROM task WHERE id_class=$1", [req.params.id]);
    res.json(result.rows);
});

app.put("/api/task/:id", async (req, res) => {
    await pool.query(
        "UPDATE task SET title = $1, deskripsi = $2, deadline = $3 WHERE id = $4",
        [req.body.title, req.body.deskripsi, req.body.deadline, req.params.id]
    );
    res.send("task berhasil di update");
});

app.delete("/api/task/:id", async (req, res) => {
    await pool.query("DELETE FROM task WHERE id = $1", [req.params.id]);
    res.send("task berhasil di detele");
});




app.listen(3000, () => console.log("Server berhasil dijalankan"));

