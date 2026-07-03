import { Router } from 'express';
import { listProducts, getProduct, getFeatured, createProduct, updateProduct, deleteProduct, createReview } from '../controllers/product.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', listProducts);
router.get('/featured', getFeatured);
router.get('/:id', getProduct);
router.post('/', requireAuth, requireAdmin, createProduct);
router.put('/:id', requireAuth, requireAdmin, updateProduct);
router.delete('/:id', requireAuth, requireAdmin, deleteProduct);
router.post('/:id/reviews', requireAuth, createReview);

export default router;
