import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token d\'authentification requis' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
}

export function requireDriver(req, res, next) {
  if (!req.user || req.user.role !== 'driver') {
    return res.status(403).json({ error: 'Accès réservé aux livreurs' });
  }
  next();
}

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.split(' ')[1], config.jwt.secret);
    } catch { /* ignore */ }
  }
  next();
}
