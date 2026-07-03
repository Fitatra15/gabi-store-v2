import { Router } from 'express';
import { listPromotions, createPromotion, applyToCategory, deletePromotion } from '../controllers/promotion.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', listPromotions);
router.post('/', requireAuth, requireAdmin, createPromotion);
router.post('/apply-category', requireAuth, requireAdmin, applyToCategory);
router.delete('/:id', requireAuth, requireAdmin, deletePromotion);

export default router;
