const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Conexión a la base de datos SQLite
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Error al conectar con SQLite:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
  }
});

// Crear tabla de usuarios si no existe
const createTable = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  dob TEXT NOT NULL,
  gender TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password TEXT NOT NULL,
  license BLOB
);`;
db.run(createTable);

// Registro
app.post('/register', async (req, res) => {
  const { name, dob, gender, email, phone, password, license } = req.body;
  if (!name || !dob || !gender || !email || !phone || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  db.run(
    `INSERT INTO users (name, dob, gender, email, phone, password, license) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, dob, gender, email, phone, hashedPassword, license],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ message: 'El correo ya está registrado.' });
        }
        return res.status(500).json({ message: 'Error al registrar usuario.' });
      }
      res.status(201).json({ message: 'Usuario registrado correctamente.' });
    }
  );
});

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña requeridos.' });
  }
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) return res.status(500).json({ message: 'Error en la base de datos.' });
    if (!user) return res.status(401).json({ message: 'Credenciales incorrectas.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Credenciales incorrectas.' });
    res.json({ message: 'Login exitoso', user: { id: user.id, name: user.name, email: user.email } });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
