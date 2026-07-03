import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import orderRoutes from './order.routes.js';
import promotionRoutes from './promotion.routes.js';
import adminRoutes from './admin.routes.js';
import uploadRoutes from './upload.routes.js';
import driverRoutes from './driver.routes.js';
import paymentRoutes from './payment.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/promotions', promotionRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/drivers', driverRoutes);
router.use('/payments', paymentRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'gabi-store-api', timestamp: new Date().toISOString() });
});

export default router;
