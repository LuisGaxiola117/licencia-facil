const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./users.db');

db.serialize(() => {
  db.run('DELETE FROM users', (err) => {
    if (err) {
      return console.error('Error al vaciar la tabla users:', err.message);
    }
    console.log('Tabla users vaciada correctamente.');
  });
});

db.close();
