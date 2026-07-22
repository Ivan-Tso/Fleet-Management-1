/**
 * SQLite database layer using sql.js (pure JS/WASM, no native compilation).
 * Provides a better-sqlite3 compatible API for this project.
 */
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'vehicle_management.db');

let _db: SqlJsDatabase | null = null;

// better-sqlite3 compatible wrapper
class StatementWrapper {
  private sql: string;
  private db: SqlJsDatabase;

  constructor(db: SqlJsDatabase, sql: string) {
    this.db = db;
    this.sql = sql;
  }

  run(...params: any[]) {
    this.db.run(this.sql, params);
    saveDb();
    // Return lastInsertRowid and changes
    const lastId = (this.db.exec("SELECT last_insert_rowid() as id")[0]?.values[0]?.[0] ?? 0) as number;
    return { lastInsertRowid: lastId, changes: 1 };
  }

  get(...params: any[]): any {
    const stmt = this.db.prepare(this.sql);
    if (params.length > 0) stmt.bind(params);
    let result: any = null;
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();
    return result;
  }

  all(...params: any[]): any[] {
    const stmt = this.db.prepare(this.sql);
    if (params.length > 0) stmt.bind(params);
    const results: any[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }
}

function getDb(): SqlJsDatabase {
  if (!_db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return _db;
}

function saveDb() {
  if (!_db) return;
  const data = _db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

export const initDb = () => {
  initSqlJs({
    locateFile: (file: string) => path.join(process.cwd(), 'node_modules/sql.js/dist/', file)
  }).then((SQL) => {
    // Load existing database if it exists
    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      _db = new SQL.Database(fileBuffer);
    } else {
      _db = new SQL.Database();
    }
    
    // Enable WAL mode (best effort)
    _db.run('PRAGMA journal_mode = WAL');

    // Create tables
    _db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        email TEXT,
        email_alerts INTEGER DEFAULT 1,
        weekly_reports INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      )
    `);
    _db.run(`
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
      )
    `);
    _db.run(`
      CREATE TABLE IF NOT EXISTS webhook_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key_hash TEXT NOT NULL UNIQUE,
        user_id INTEGER NOT NULL,
        scope TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        revoked_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    _db.run(`
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
      )
    `);
    _db.run(`
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
      )
    `);
    _db.run(`
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
      )
    `);
    _db.run(`
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
      )
    `);
    _db.run(`
      CREATE TABLE IF NOT EXISTS ai_analysis_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicleId INTEGER NOT NULL,
        analysis_text TEXT NOT NULL,
        created_by INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    _db.run(`
      CREATE TABLE IF NOT EXISTS fuel_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicleId INTEGER NOT NULL,
        date TEXT NOT NULL,
        liters REAL NOT NULL,
        pricePerLiter REAL NOT NULL,
        totalCost REAL NOT NULL,
        isFullTank INTEGER DEFAULT 0,
        mileage REAL,
        station TEXT,
        notes TEXT,
        created_by INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    _db.run(`
      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicleId INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        dueDate TEXT NOT NULL,
        repeatInterval TEXT,
        isCompleted INTEGER DEFAULT 0,
        created_by INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // Create default admin user if no users exist
    const countResult = _db.exec("SELECT COUNT(*) as count FROM users");
    const count = countResult[0]?.values[0]?.[0] ?? 0;
    
    if (count === 0) {
      const adminHash = bcrypt.hashSync('Admin@123', 10);
      const userHash = bcrypt.hashSync('User@123', 10);
      _db.run("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", ['admin', adminHash, 'admin']);
      _db.run("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", ['user', userHash, 'user']);
    }

    // Schema migrations (add columns if missing)
    const tableInfo = _db.exec("PRAGMA table_info(vehicles)");
    const vehicleCols = tableInfo[0]?.values.map((v: any) => v[1]) || [];
    if (!vehicleCols.includes('imageUrl')) {
      _db.run("ALTER TABLE vehicles ADD COLUMN imageUrl TEXT");
    }
    if (!vehicleCols.includes('mileage')) {
      _db.run("ALTER TABLE vehicles ADD COLUMN mileage REAL DEFAULT 0");
    }
    if (!vehicleCols.includes('department')) {
      _db.run("ALTER TABLE vehicles ADD COLUMN department TEXT");
    }

    const userTableInfo = _db.exec("PRAGMA table_info(users)");
    const userCols = userTableInfo[0]?.values.map((v: any) => v[1]) || [];
    if (!userCols.includes('email')) {
      _db.run("ALTER TABLE users ADD COLUMN email TEXT");
    }
    if (!userCols.includes('email_alerts')) {
      _db.run("ALTER TABLE users ADD COLUMN email_alerts INTEGER DEFAULT 1");
    }
    if (!userCols.includes('weekly_reports')) {
      _db.run("ALTER TABLE users ADD COLUMN weekly_reports INTEGER DEFAULT 0");
    }

    saveDb();
    console.log('Database initialized successfully');
  }).catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
};

// better-sqlite3 compatible API
const db = {
  prepare: (sql: string): any => {
    if (!_db) throw new Error('Database not initialized');
    return new StatementWrapper(_db, sql);
  },
  exec: (sql: string) => {
    if (!_db) throw new Error('Database not initialized');
    _db.run(sql);
    saveDb();
  },
  // For raw SQL execution that returns results
  query: (sql: string): any[] => {
    if (!_db) throw new Error('Database not initialized');
    const result = _db.exec(sql);
    if (result.length === 0) return [];
    const cols = result[0].columns;
    return result[0].values.map((row: any[]) => {
      const obj: any = {};
      cols.forEach((col: string, i: number) => { obj[col] = row[i]; });
      return obj;
    });
  }
};

// Persist DB on process exit
process.on('exit', () => saveDb());
process.on('SIGINT', () => { saveDb(); process.exit(); });
process.on('SIGTERM', () => { saveDb(); process.exit(); });

export default db;