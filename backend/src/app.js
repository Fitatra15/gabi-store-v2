import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import rateLimit from 'express-rate-limit';

import config from './config/env.js';
import { sequelize } from './models/index.js';
import apiRoutes from './routes/index.js';
import { seedDatabase } from '../seeders/seed.js';

// Ensure uploads directory exists
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();
const httpServer = createServer(app);

// Serve uploaded images as static files
app.use('/uploads', express.static(uploadsDir));

// Socket.io for GPS tracking
const io = new SocketServer(httpServer, {
  cors: { origin: config.cors.origin, methods: ['GET', 'POST'] },
});

// ─── Middlewares ───
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, max: 200,
  message: { error: 'Trop de requêtes, veuillez réessayer dans une minute' },
});
const authLimiter = rateLimit({
  windowMs: 60 * 1000, max: 15,
  message: { error: 'Trop de tentatives, veuillez réessayer dans une minute' },
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── API Routes ───
app.use('/api', apiRoutes);

// ─── Socket.io Events ───
io.on('connection', (socket) => {
  console.log(`🔌 Client connecté: ${socket.id}`);

  // Driver sends GPS update
  socket.on('driver:location', (data) => {
    const { orderId, lat, lng } = data;
    io.to(`order:${orderId}`).emit('tracking:update', { lat, lng, timestamp: new Date().toISOString() });
  });

  // Client joins order tracking room
  socket.on('tracking:join', (orderId) => {
    socket.join(`order:${orderId}`);
    console.log(`📍 Client ${socket.id} suit la commande ${orderId}`);
  });

  socket.on('tracking:leave', (orderId) => {
    socket.leave(`order:${orderId}`);
  });

  // Order status update broadcast
  socket.on('order:statusUpdate', (data) => {
    io.to(`order:${data.orderId}`).emit('order:statusChanged', data);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client déconnecté: ${socket.id}`);
  });
});

// Make io accessible in controllers
app.set('io', io);

// ─── Serve Frontend (Production) ───
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  // SPA fallback: toutes les routes non-API renvoient vers index.html
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads') && !req.path.startsWith('/socket.io') && !req.path.includes('.')) {
      return res.sendFile(path.join(frontendDist, 'index.html'));
    }
    next();
  });
  console.log('📦 Frontend servi depuis', frontendDist);
} else {
  console.log('⚠️  Frontend non buildé (npm run build dans /frontend)');
}

// ─── Error Handler ───
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.stack);
  res.status(err.status || 500).json({
    error: config.nodeEnv === 'development' ? err.message : 'Erreur interne du serveur',
  });
});

// 404 API Handler
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// ─── Start ───
async function start() {
  try {
    // Sync database
    await sequelize.sync();
    console.log('✅ Base de données synchronisée');

    // Seed if empty
    await seedDatabase();

    httpServer.listen(config.port, () => {
      console.log(`\n🚀 Gabi-Store API démarrée sur http://localhost:${config.port}`);
      console.log(`📍 Antsiranana, Madagascar`);
      console.log(`🔗 API: http://localhost:${config.port}/api`);
      console.log(`💚 Health: http://localhost:${config.port}/api/health\n`);
    });
  } catch (err) {
    console.error('❌ Erreur au démarrage:', err);
    process.exit(1);
  }
}

start();
