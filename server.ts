import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import fs from 'fs';
import * as pdfParseModule from 'pdf-parse';
const pdfParse = (pdfParseModule as any).default || pdfParseModule;

import db, { initDb } from './database.js';

// Initialize the Database
const dbReady = initDb();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_default';
if (JWT_SECRET === 'super_secret_key_default' && process.env.NODE_ENV === 'production') {
  console.error('WARNING: JWT_SECRET environment variable is not set. Using default insecure key.');
}

// Multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  }
});

const manualUpload = multer({
  dest: 'uploads/',
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain', 'text/markdown'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  }
});

// Create an express app
const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
app.use(express.json());

// Serve uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Extend Express Request
interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string };
}

// Authentication Middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  
  // Also check query parameters (useful for Webhooks like MS Forms)
  if (!token && req.query.token) {
    token = req.query.token as string;
  }
  
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user as any;
    next();
  });
};

/* --- Auth Routes --- */
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const validPassword = bcrypt.compareSync(password, user.password_hash);
  if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

/* --- API Endpoints --- */
// Fetch all dashboard data, filtered by user
app.get('/api/data', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const isAdmin = req.user!.role === 'admin';

  let vehicles, usageLogs, expenses, maintenance;
  
  if (isAdmin) {
    vehicles = db.prepare('SELECT * FROM vehicles').all();
    usageLogs = db.prepare('SELECT * FROM usage_logs').all();
    expenses = db.prepare('SELECT * FROM expense_logs').all();
    maintenance = db.prepare('SELECT * FROM maintenance_records').all();
  } else {
    vehicles = db.prepare('SELECT * FROM vehicles WHERE created_by = ?').all(userId);
    usageLogs = db.prepare('SELECT * FROM usage_logs WHERE created_by = ?').all(userId);
    expenses = db.prepare('SELECT * FROM expense_logs WHERE created_by = ?').all(userId);
    maintenance = db.prepare('SELECT * FROM maintenance_records WHERE created_by = ?').all(userId);
  }

  // Typecasting fields to string strings for frontend matching
  const mapToStringId = (items: any[]) => items.map(d => ({ ...d, id: String(d.id), vehicleId: String(d.vehicleId) }));

  res.json({
    vehicles: vehicles.map((d: any) => ({ ...d, id: String(d.id) })),
    maintenance: mapToStringId(maintenance),
    usageLogs: mapToStringId(usageLogs),
    expenses: mapToStringId(expenses)
  });
});

// Webhooks with Authentication
app.post('/api/webhook/usage-logs', authenticateToken, (req: AuthRequest, res: Response) => {
  const { vehicleId, driverName, date, startTime, endTime, startMileage, endMileage, purpose, destination } = req.body;
  const sV = parseFloat(startMileage) || 0;
  const eV = parseFloat(endMileage) || 0;
  const userId = req.user!.id;

  if (req.user!.role !== 'admin') {
    const v = db.prepare('SELECT created_by FROM vehicles WHERE id = ?').get(vehicleId) as any;
    if (!v || v.created_by !== userId) return res.status(403).json({ error: 'Forbidden' });
  }

  const stmt = db.prepare(`INSERT INTO usage_logs (vehicleId, driverName, date, startTime, endTime, startMileage, endMileage, purpose, destination, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const info = stmt.run(vehicleId, driverName, date, startTime, endTime, sV, eV, purpose, destination, userId);
  res.json({ success: true, id: String(info.lastInsertRowid) });
});

app.post('/api/webhook/expenses', authenticateToken, (req: AuthRequest, res: Response) => {
  const { vehicleId, date, month, type, amount, description } = req.body;
  const userId = req.user!.id;
  const amt = parseFloat(amount) || 0;

  if (req.user!.role !== 'admin') {
    const v = db.prepare('SELECT created_by FROM vehicles WHERE id = ?').get(vehicleId) as any;
    if (!v || v.created_by !== userId) return res.status(403).json({ error: 'Forbidden' });
  }

  const stmt = db.prepare(`INSERT INTO expense_logs (vehicleId, date, month, type, amount, description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const info = stmt.run(vehicleId, date, month, type, amt, description, userId);
  res.json({ success: true, id: String(info.lastInsertRowid) });
});

app.post('/api/webhook/maintenance', authenticateToken, (req: AuthRequest, res: Response) => {
  const { vehicleId, date, type, description, cost, status } = req.body;
  const userId = req.user!.id;
  const amt = parseFloat(cost) || 0;

  if (req.user!.role !== 'admin') {
    const v = db.prepare('SELECT created_by FROM vehicles WHERE id = ?').get(vehicleId) as any;
    if (!v || v.created_by !== userId) return res.status(403).json({ error: 'Forbidden' });
  }

  const stmt = db.prepare(`INSERT INTO maintenance_records (vehicleId, date, type, description, cost, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const info = stmt.run(vehicleId, date, type, description, amt, status, userId);
  res.json({ success: true, id: String(info.lastInsertRowid) });
});

// User Management (Admin Only)
app.get('/api/users', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const users = db.prepare('SELECT id, username, role, created_at FROM users').all();
  res.json({ users: users.map((u: any) => ({ ...u, id: String(u.id) })) });
});

app.post('/api/users', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  
  try {
    const passwordHash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
    const info = stmt.run(username, passwordHash, role || 'user');
    res.json({ success: true, id: String(info.lastInsertRowid) });
  } catch (err: any) {
    if (err.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
});

app.delete('/api/users/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const userId = req.params.id;
  
  try {
    db.exec('BEGIN TRANSACTION');
    db.prepare('DELETE FROM usage_logs WHERE created_by = ?').run(userId);
    db.prepare('DELETE FROM expense_logs WHERE created_by = ?').run(userId);
    db.prepare('DELETE FROM maintenance_records WHERE created_by = ?').run(userId);
    db.prepare('DELETE FROM vehicles WHERE created_by = ?').run(userId);
    db.prepare('DELETE FROM uploaded_manuals WHERE created_by = ?').run(userId);
    db.prepare('DELETE FROM ai_analysis_cache WHERE created_by = ?').run(userId);
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    db.exec('COMMIT');
    res.json({ success: true });
  } catch (err) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Data Management
app.delete('/api/data/clear', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  
  try {
    db.exec('BEGIN TRANSACTION');
    db.prepare('DELETE FROM usage_logs WHERE created_by = ?').run(userId);
    db.prepare('DELETE FROM expense_logs WHERE created_by = ?').run(userId);
    db.prepare('DELETE FROM maintenance_records WHERE created_by = ?').run(userId);
    db.prepare('DELETE FROM uploaded_manuals WHERE created_by = ?').run(userId);
    db.prepare('DELETE FROM ai_analysis_cache WHERE created_by = ?').run(userId);
    db.prepare('DELETE FROM vehicles WHERE created_by = ?').run(userId);
    db.exec('COMMIT');
    res.json({ success: true });
  } catch (err) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

// Update user profile
app.put('/api/users/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  const { username, email, email_alerts, weekly_reports } = req.body;
  const userId = req.user!.id;
  
  if (!username) return res.status(400).json({ error: 'Username is required' });
  
  const stmt = db.prepare('UPDATE users SET username = ?, email = ?, email_alerts = ?, weekly_reports = ? WHERE id = ?');
  stmt.run(username, email || null, email_alerts ? 1 : 0, weekly_reports ? 1 : 0, userId);
  
  // Refetch user to update JWT if needed, or just return success
  res.json({ success: true, user: { id: userId, username, role: req.user!.role, email, email_alerts: !!email_alerts, weekly_reports: !!weekly_reports } });
});

// Update vehicle
app.put('/api/vehicles/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const { make, model, year, licensePlate, status, department, mileage } = req.body;
  const vehicleId = req.params.id;
  const userId = req.user!.id;
  const mileageVal = parseFloat(mileage) || 0;

  if (req.user!.role !== 'admin') {
    const v = db.prepare('SELECT created_by FROM vehicles WHERE id = ?').get(vehicleId) as any;
    if (!v || v.created_by !== userId) return res.status(403).json({ error: 'Forbidden' });
  }

  const stmt = db.prepare(`UPDATE vehicles SET make = ?, model = ?, year = ?, licensePlate = ?, status = ?, department = ?, mileage = ? WHERE id = ?`);
  stmt.run(make, model, year, licensePlate, status || 'active', department || null, mileageVal, vehicleId);
  res.json({ success: true });
});

// Delete vehicle
app.delete('/api/vehicles/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const vehicleId = req.params.id;
  const userId = req.user!.id;

  if (req.user!.role !== 'admin') {
    const v = db.prepare('SELECT created_by FROM vehicles WHERE id = ?').get(vehicleId) as any;
    if (!v || v.created_by !== userId) return res.status(403).json({ error: 'Forbidden' });
  }

  db.exec('BEGIN TRANSACTION');
  try {
    db.prepare('DELETE FROM usage_logs WHERE vehicleId = ?').run(vehicleId);
    db.prepare('DELETE FROM expense_logs WHERE vehicleId = ?').run(vehicleId);
    db.prepare('DELETE FROM maintenance_records WHERE vehicleId = ?').run(vehicleId);
    db.prepare('DELETE FROM uploaded_manuals WHERE vehicleId = ?').run(vehicleId);
    db.prepare('DELETE FROM ai_analysis_cache WHERE vehicleId = ?').run(vehicleId);
    db.prepare('DELETE FROM vehicles WHERE id = ?').run(vehicleId);
    db.exec('COMMIT');
    res.json({ success: true });
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
});
app.post('/api/vehicles', authenticateToken, upload.single('image'), (req: AuthRequest, res: Response) => {
  const { make, model, year, licensePlate, status, department, mileage } = req.body;
  const userId = req.user!.id;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const mileageVal = parseFloat(mileage) || 0;

  const stmt = db.prepare(`INSERT INTO vehicles (make, model, year, licensePlate, status, imageUrl, department, mileage, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const info = stmt.run(make, model, year, licensePlate, status || 'active', imageUrl, department || null, mileageVal, userId);
  res.json({ success: true, id: String(info.lastInsertRowid) });
});

// AI Analysis Endpoints
app.post('/api/ai-analysis', authenticateToken, manualUpload.array('manuals'), async (req: AuthRequest, res: Response) => {
  const vehicleId = req.body.vehicleId;
  const customPrompt = req.body.customPrompt;
  const userId = req.user!.id;
  
  if (!vehicleId) return res.status(400).json({ error: 'vehicleId is required' });

  // Data isolation
  if (req.user!.role !== 'admin') {
     const v = db.prepare('SELECT created_by FROM vehicles WHERE id = ?').get(vehicleId) as any;
     if (!v || v.created_by !== userId) return res.status(403).json({ error: 'Forbidden' });
  }

  // 1. Save uploaded manuals
  const files = req.files as Express.Multer.File[];
  if (files && files.length > 0) {
    const insertManual = db.prepare(`INSERT INTO uploaded_manuals (vehicleId, filename, original_filename, file_type, extracted_text, created_by) VALUES (?, ?, ?, ?, ?, ?)`);
    for (const f of files) {
       let text = '';
       if (f.mimetype === 'application/pdf') {
         try {
           const dataBuffer = fs.readFileSync(f.path);
           const data = await pdfParse(dataBuffer);
           text = data.text;
         } catch (err) {
           console.error('PDF Parse Error', err);
         }
       } else {
         text = fs.readFileSync(f.path, 'utf8');
       }
       insertManual.run(vehicleId, f.filename, f.originalname, f.mimetype, text.substring(0, 100000), userId);
    }
  }

  // 2. Fetch history and vehicle details
  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId) as any;
  const history = db.prepare('SELECT * FROM maintenance_records WHERE vehicleId = ? ORDER BY date DESC').all(vehicleId);
  const manuals = db.prepare('SELECT extracted_text FROM uploaded_manuals WHERE vehicleId = ?').all(vehicleId);
  
  let manualContext = "No manuals provided.";
  if (manuals.length > 0) {
    manualContext = manuals.map((m: any) => m.extracted_text).join('\\n\\n').substring(0, 50000); // Send up to 50k chars
  }

  try {
    const aiProvider = req.headers['x-ai-provider'] as string || 'default';
    const aiKey = req.headers['x-ai-key'] as string;
    
    const prompt = `
      You are an expert mechanic. Analyze the maintenance history and manuals for this vehicle:
      Vehicle: ${vehicle.make} ${vehicle.model} (${vehicle.year}) - Plate: ${vehicle.licensePlate}
      
      Maintenance History:
      ${JSON.stringify(history)}
      
      Manuals Snippets:
      ${manualContext}
      
      ${customPrompt ? `User's Specific Question/Instruction: ${customPrompt}` : ''}
      
      Provide a comprehensive maintenance analysis in markdown format. Identify risks, suggest immediate actions, and estimate future costs. Include specific references to the history or manuals where applicable.
      ${customPrompt ? 'Make sure to explicitly address the user\'s specific question/instruction at the beginning of your response.' : ''}
    `;

    let analysisText = '';

    if (aiProvider === 'openai') {
      const openai = new OpenAI({ apiKey: aiKey });
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
      });
      analysisText = response.choices[0].message.content || "Analysis failed to yield results.";
    } else {
      // Use Gemini (either custom key or system default)
      const apiKey = (aiProvider === 'gemini_custom' && aiKey) ? aiKey : process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      analysisText = response.text || "Analysis failed to yield results.";
    }

    // Cache the analysis
    db.prepare('DELETE FROM ai_analysis_cache WHERE vehicleId = ?').run(vehicleId);
    db.prepare('INSERT INTO ai_analysis_cache (vehicleId, analysis_text, created_by) VALUES (?, ?, ?)').run(vehicleId, analysisText, userId);

    res.json({ success: true, analysis: analysisText });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'AI analysis failed: ' + err.message });
  }
});

app.get('/api/ai-analysis/:vehicleId', authenticateToken, (req: AuthRequest, res: Response) => {
  const { vehicleId } = req.params;
  const userId = req.user!.id;
  
  if (req.user!.role !== 'admin') {
     const v = db.prepare('SELECT created_by FROM vehicles WHERE id = ?').get(vehicleId) as any;
     if (!v || v.created_by !== userId) return res.status(403).json({ error: 'Forbidden' });
  }

  const cache = db.prepare('SELECT analysis_text FROM ai_analysis_cache WHERE vehicleId = ? ORDER BY created_at DESC LIMIT 1').get(vehicleId) as any;
  if (!cache) {
    return res.json({ success: false, error: 'No analysis found.' });
  }
  return res.json({ success: true, analysis: cache.analysis_text });
});


app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  if (err instanceof multer.MulterError || err.message === 'Invalid file type') {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// Export function to start
async function startServer() {
  await dbReady;
  console.log('Database ready');
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
