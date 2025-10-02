const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = 4000;

// Seguridad HTTP headers
app.use(helmet());

// Limitar peticiones para evitar ataques de fuerza bruta y DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones por IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aumenta el límite para imágenes grandes

// Clave y vector de inicialización para AES (en producción usa variables de entorno)
const AES_KEY = crypto.scryptSync('supersecreto123', 'salt', 32); // 32 bytes para AES-256
const AES_IV = Buffer.alloc(16, 0); // IV fijo para ejemplo

function encryptAES(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', AES_KEY, AES_IV);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

function decryptAES(encrypted) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', AES_KEY, AES_IV);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

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
    return res.status(400).json({ message: 'Todos los campos son obligatorios. ( ͡❛ ⏥ ͡❛)'});
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  // Cifrar la imagen de licencia si existe
  let encryptedLicense = null;
  if (license) {
    encryptedLicense = encryptAES(license);
  }
  db.run(
    `INSERT INTO users (name, dob, gender, email, phone, password, license) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, dob, gender, email, phone, hashedPassword, encryptedLicense],
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
// Endpoint para obtener la imagen de licencia descifrada
app.get('/license/:email', (req, res) => {
  const { email } = req.params;
  db.get('SELECT license FROM users WHERE email = ?', [email], (err, row) => {
    if (err || !row || !row.license) {
      return res.status(404).json({ message: 'No encontrada' });
    }
    try {
      const decrypted = decryptAES(row.license);
      res.json({ license: decrypted });
    } catch {
      res.status(500).json({ message: 'Error al descifrar' });
    }
  });
});
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
