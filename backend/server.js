const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(cors()); // Habilita CORS para que el front-end pueda hacer peticiones
app.use(express.json()); // Para poder manejar los datos JSON

// Conexión con la base de datos SQLite
const db = new sqlite3.Database('./hotel.db'); // Cambia esto si tu base de datos tiene otro nombre

// Rutas de la API
app.get('/api/anuncios', (req, res) => {
    db.all('SELECT * FROM advertisements', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ anuncios: rows });
    });
});

app.post('/api/anuncios', (req, res) => {
    const { title, description, issue_date, expiration_date, departments } = req.body;
    const query = 'INSERT INTO advertisements (title, description, issue_date, expiration_date, departments) VALUES (?, ?, ?, ?, ?)';
    db.run(query, [title, description, issue_date, expiration_date, departments], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

// Inicia el servidor
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
