import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('vehicle_management.db');
db.pragma('journal_mode = WAL');

// Initialize database schema
export const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      licensePlate TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      imageUrl TEXT,
      department TEXT,
      mileage REAL DEFAULT 0,
      created_by INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS webhook_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key_hash TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      scope TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      revoked_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS usage_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicleId INTEGER NOT NULL,
      driverName TEXT NOT NULL,
      date TEXT NOT NULL,
      startTime TEXT,
      endTime TEXT,
      startMileage REAL NOT NULL,
      endMileage REAL NOT NULL,
      purpose TEXT NOT NULL,
      destination TEXT,
      created_by INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS expense_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicleId INTEGER NOT NULL,
      date TEXT,
      month TEXT,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      created_by INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS maintenance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicleId INTEGER NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      cost REAL NOT NULL,
      status TEXT DEFAULT 'scheduled',
      created_by INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS uploaded_manuals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicleId INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      file_type TEXT NOT NULL,
      extracted_text TEXT,
      created_by INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS ai_analysis_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicleId INTEGER NOT NULL,
      analysis_text TEXT NOT NULL,
      created_by INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );
  `);

  // Create default admin user if no users exist
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const { count } = countStmt.get() as { count: number };
  
  if (count === 0) {
    const adminHash = bcrypt.hashSync('Admin@123', 10);
    const userHash = bcrypt.hashSync('User@123', 10);
    
    const insertUser = db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)");
    insertUser.run('admin', adminHash, 'admin');
    insertUser.run('user', userHash, 'user');
  }

  // Schema migrations
  try {
    db.exec(`ALTER TABLE vehicles ADD COLUMN imageUrl TEXT`);
  } catch (e) {}

  try {
    db.exec(`ALTER TABLE users ADD COLUMN email TEXT`);
  } catch (e) {}

  try {
    db.exec(`ALTER TABLE users ADD COLUMN email_alerts INTEGER DEFAULT 1`);
  } catch (e) {}

  try {
    db.exec(`ALTER TABLE users ADD COLUMN weekly_reports INTEGER DEFAULT 0`);
  } catch (e) {}

  try {
    db.exec(`ALTER TABLE vehicles ADD COLUMN mileage REAL DEFAULT 0`);
  } catch (e) {}

  try {
    db.exec(`ALTER TABLE vehicles ADD COLUMN department TEXT`);
  } catch (e) {}

  try {
    db.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`);
    // Update existing admin user
    db.prepare("UPDATE users SET role = 'admin' WHERE username = 'admin'").run();
  } catch (e) {}
};

export default db;
