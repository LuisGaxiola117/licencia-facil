const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error('Error abriendo DB:', err.message);
  console.log('DB abierta en', dbPath);
  db.all("PRAGMA table_info(users);", [], (err, rows) => {
    if (err) {
      console.error('Error obteniendo PRAGMA:', err.message);
      db.close();
      return;
    }
    console.log('Columnas actuales:', rows.map(r => r.name).join(', '));
    const hasTipo = rows.some(r => r.name === 'tipo');
    if (hasTipo) {
      console.log("La columna 'tipo' ya existe. No se requiere acción.");
      db.close();
      return;
    }
    console.log("Añadiendo columna 'tipo'...\n");
    db.run("ALTER TABLE users ADD COLUMN tipo TEXT", (alterErr) => {
      if (alterErr) console.error('Error añadiendo columna tipo:', alterErr.message);
      else console.log("Columna 'tipo' añadida correctamente.");
      db.close();
    });
  });
});
