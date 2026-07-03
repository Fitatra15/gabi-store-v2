import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/env.js';
import { User, RefreshToken, VerificationCode } from '../models/index.js';
import { sendVerificationEmail } from '../services/email.service.js';

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email, name: user.name },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function register(req, res) {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }
    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }
    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name, email: email.toLowerCase(), phone: phone || null,
      password_hash, role: 'customer', is_verified: false, // NOT verified by default
    });

    // Generate verification code
    const code = generateVerificationCode();
    await VerificationCode.create({
      user_id: user.id, email: user.email, code,
      type: 'email_verify',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    // Send real verification email via Gmail
    await sendVerificationEmail(user.email, code, user.name);
    console.log(`📧 Code de vérification envoyé à ${user.email}`);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      user_id: user.id, token_hash: hashToken(refreshToken), expires_at: expiresAt,
    });
    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar_url: user.avatar_url, is_verified: user.is_verified },
      accessToken, refreshToken, expiresAt,
      verificationRequired: true,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// Verify email with code
export async function verifyEmail(req, res) {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email et code requis' });

    const verification = await VerificationCode.findOne({
      where: { email: email.toLowerCase(), code, type: 'email_verify', used_at: null },
    });
    if (!verification) return res.status(400).json({ error: 'Code invalide' });
    if (new Date(verification.expires_at) < new Date()) return res.status(400).json({ error: 'Code expiré. Demandez un nouveau code.' });

    // Mark code as used
    verification.used_at = new Date();
    await verification.save();

    // Verify user
    const user = await User.findByPk(verification.user_id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    user.is_verified = true;
    await user.save();

    res.json({ message: 'Email vérifié avec succès !', user: { id: user.id, name: user.name, email: user.email, is_verified: true } });
  } catch (err) {
    console.error('verifyEmail error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// Resend verification code
export async function resendVerification(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    if (user.is_verified) return res.status(400).json({ error: 'Email déjà vérifié' });

    const code = generateVerificationCode();
    await VerificationCode.create({
      user_id: user.id, email: user.email, code,
      type: 'email_verify',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // Send real email
    await sendVerificationEmail(user.email, code, user.name);
    console.log(`📧 Nouveau code envoyé à ${user.email}`);
    res.json({
      message: 'Nouveau code envoyé à votre adresse email',
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Check if email verified
    if (!user.is_verified) {
      return res.status(403).json({
        error: 'Veuillez vérifier votre email avant de vous connecter',
        verificationRequired: true,
        email: user.email,
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      user_id: user.id, token_hash: hashToken(refreshToken), expires_at: expiresAt,
    });
    res.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar_url: user.avatar_url, is_verified: user.is_verified },
      accessToken, refreshToken, expiresAt,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function refresh(req, res) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ error: 'Refresh token requis' });
    const tokenHash = hashToken(token);
    const stored = await RefreshToken.findOne({
      where: { token_hash: tokenHash, revoked_at: null },
    });
    if (!stored || new Date(stored.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Refresh token invalide ou expiré' });
    }
    stored.revoked_at = new Date();
    await stored.save();
    const user = await User.findByPk(stored.user_id);
    if (!user) return res.status(401).json({ error: 'Utilisateur introuvable' });
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      user_id: user.id, token_hash: hashToken(newRefreshToken), expires_at: expiresAt,
    });
    res.json({ accessToken, refreshToken: newRefreshToken, expiresAt });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findByPk(req.user.sub, {
      attributes: ['id', 'name', 'email', 'phone', 'role', 'avatar_url', 'is_verified', 'created_at'],
    });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function updateMe(req, res) {
  try {
    const user = await User.findByPk(req.user.sub);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    const { name, phone, avatar_url } = req.body;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar_url) user.avatar_url = avatar_url;
    await user.save();
    res.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar_url: user.avatar_url },
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function logout(req, res) {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      const tokenHash = hashToken(token);
      await RefreshToken.update({ revoked_at: new Date() }, { where: { token_hash: tokenHash } });
    }
    res.json({ message: 'Déconnexion réussie' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
