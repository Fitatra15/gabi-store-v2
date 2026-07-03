import { Router } from 'express';
import { register, login, refresh, getMe, updateMe, logout, verifyEmail, resendVerification } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/refresh', refresh);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, updateMe);

export default router;
