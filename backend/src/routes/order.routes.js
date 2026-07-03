import { Router } from 'express';
import { createOrder, listOrders, getOrder, updateOrderStatus } from '../controllers/order.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.post('/', requireAuth, createOrder);
router.get('/', requireAuth, listOrders);
router.get('/:id', requireAuth, getOrder);
router.put('/:id/status', requireAuth, requireAdmin, updateOrderStatus);

export default router;
