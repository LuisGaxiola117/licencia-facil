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

// Derivación de claves y soporte para varios algoritmos nativos
const DEFAULT_PASSPHRASE = process.env.AES_PASSPHRASE || 'supersecreto123';
const DEFAULT_SALT = process.env.SCRYPT_SALT || 'salt';

function deriveKeyForAlgo(passphrase, salt, algoId) {
  let len = 32; // default
  if (algoId === 'aes-128-gcm' || algoId === 'aes-128-cbc') len = 16;
  else if (algoId === 'des-ede3-cbc') len = 24;
  else if (algoId === 'chacha20-poly1305') len = 32;
  else if (algoId === 'aes-256-gcm' || algoId === 'aes-256-cbc') len = 32;
  return crypto.scryptSync(passphrase, salt, len);
}

function encryptLicense(text, algo = 'aes-256-gcm') {
  const pass = DEFAULT_PASSPHRASE;
  const salt = DEFAULT_SALT;
  const key = deriveKeyForAlgo(pass, salt, algo);

  if (algo === 'aes-128-gcm' || algo === 'aes-256-gcm') {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(algo, key, iv, { authTagLength: 16 });
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const tag = cipher.getAuthTag();
    return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted}`;
  }

  if (algo === 'aes-128-cbc' || algo === 'aes-256-cbc') {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algo, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return `${iv.toString('base64')}:${encrypted}`;
  }

  if (algo === 'des-ede3-cbc') {
    const iv = crypto.randomBytes(8);
    const cipher = crypto.createCipheriv('des-ede3-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return `${iv.toString('base64')}:${encrypted}`;
  }

  if (algo === 'chacha20-poly1305') {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('chacha20-poly1305', key, iv, { authTagLength: 16 });
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const tag = cipher.getAuthTag();
    return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted}`;
  }

  throw new Error('Algoritmo de cifrado no soportado');
}

function decryptLicense(stored, algo = 'aes-256-gcm') {
  if (!stored) return null;
  const pass = DEFAULT_PASSPHRASE;
  const salt = DEFAULT_SALT;
  const key = deriveKeyForAlgo(pass, salt, algo);

  if (algo === 'aes-128-gcm' || algo === 'aes-256-gcm') {
    const parts = stored.split(':');
    if (parts.length !== 3) throw new Error('Formato inválido para GCM');
    const iv = Buffer.from(parts[0], 'base64');
    const tag = Buffer.from(parts[1], 'base64');
    const encrypted = parts[2];
    const decipher = crypto.createDecipheriv(algo, key, iv, { authTagLength: 16 });
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  if (algo === 'aes-128-cbc' || algo === 'aes-256-cbc') {
    const parts = stored.split(':');
    if (parts.length !== 2) throw new Error('Formato inválido para CBC');
    const iv = Buffer.from(parts[0], 'base64');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(algo, key, iv);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  if (algo === 'des-ede3-cbc') {
    const parts = stored.split(':');
    if (parts.length !== 2) throw new Error('Formato inválido para 3DES');
    const iv = Buffer.from(parts[0], 'base64');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv('des-ede3-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  if (algo === 'chacha20-poly1305') {
    const parts = stored.split(':');
    if (parts.length !== 3) throw new Error('Formato inválido para ChaCha20');
    const iv = Buffer.from(parts[0], 'base64');
    const tag = Buffer.from(parts[1], 'base64');
    const encrypted = parts[2];
    const decipher = crypto.createDecipheriv('chacha20-poly1305', key, iv, { authTagLength: 16 });
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  throw new Error('Algoritmo/deserialización no soportado o datos corruptos');
}

// Conexión a la base de datos SQLite
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Error al conectar con SQLite:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
  }
});

// Crear tabla de usuarios si no existe (agregamos columna 'tipo' para algoritmo)
const createTable = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  dob TEXT NOT NULL,
  gender TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password TEXT NOT NULL,
  license BLOB,
  tipo TEXT
);`;
db.run(createTable);

// Migration: ensure 'tipo' column exists for older DBs
db.all("PRAGMA table_info(users);", [], (err, rows) => {
  if (err) {
    console.error('Error comprobando esquema users:', err);
    return;
  }
  const hasTipo = rows.some(r => r.name === 'tipo');
  if (!hasTipo) {
    console.log("Columna 'tipo' ausente en users: añadiendo ALTER TABLE para agregarla...");
    db.run("ALTER TABLE users ADD COLUMN tipo TEXT", (alterErr) => {
      if (alterErr) console.error('Error añadiendo columna tipo:', alterErr);
      else console.log("Columna 'tipo' añadida correctamente.");
    });
  }
});

// Registro
app.post('/register', async (req, res) => {
  const { name, dob, gender, email, phone, password, license, tipo } = req.body;
  if (!name || !dob || !gender || !email || !phone || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios. ( ͡❛ ⏥ ͡❛)'});
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  // Cifrar la imagen de licencia si existe
  let encryptedLicense = null;
  let algoToUse = tipo || 'aes-256-gcm';
  try {
    if (license) {
      encryptedLicense = encryptLicense(license, algoToUse);
    }
  } catch (err) {
    console.error('Error cifrando la licencia:', err);
    return res.status(500).json({ message: 'Error al cifrar la licencia' });
  }
  db.run(
    `INSERT INTO users (name, dob, gender, email, phone, password, license, tipo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, dob, gender, email, phone, hashedPassword, encryptedLicense, algoToUse],
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

// Endpoint para obtener la imagen de licencia descifrada
app.get('/license/:email', (req, res) => {
  const { email } = req.params;
  db.get('SELECT license, tipo FROM users WHERE email = ?', [email], (err, row) => {
    if (err || !row || !row.license) {
      return res.status(404).json({ message: 'No encontrada' });
    }
    try {
  const algo = row.tipo || 'aes-256-gcm';
  const decrypted = decryptLicense(row.license, algo);
  // Return both decrypted (for display) and the raw encrypted blob + algorithm id
  res.json({ license: decrypted, encrypted: row.license, algo });
    } catch (e) {
      console.error('Error descifrando licencia:', e);
      res.status(500).json({ message: 'Error al descifrar' });
    }
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
