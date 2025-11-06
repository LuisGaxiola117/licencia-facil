const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error('Error abriendo DB:', err.message);
  console.log('DB abierta en', dbPath);
  db.all("PRAGMA table_info(users);", [], (err, rows) => {
    if (err) {
      console.error('Error obteniendo PRAGMA:', err.message);
    } else {
      console.log('PRAGMA table_info(users):');
      console.log(JSON.stringify(rows, null, 2));
    }
    db.close();
  });
});
