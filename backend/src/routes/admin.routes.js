import { Router } from 'express';
import { getDashboard, listUsers, listDrivers } from '../controllers/admin.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/dashboard', requireAuth, requireAdmin, getDashboard);
router.get('/users', requireAuth, requireAdmin, listUsers);
router.get('/drivers', requireAuth, requireAdmin, listDrivers);

export default router;
