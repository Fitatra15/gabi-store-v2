import { Router } from 'express';
import { Payment, Order, User } from '../models/index.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';

const router = Router();

// List all payments (admin)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    const payments = await Payment.findAll({
      where, order: [['created_at', 'DESC']],
      include: [{ model: Order, attributes: ['id', 'order_number', 'total', 'user_id', 'status'],
        include: [{ model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] }]
      }],
    });
    res.json({ payments });
  } catch (err) {
    console.error('list payments error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get payment status for an order
router.get('/order/:orderId', requireAuth, async (req, res) => {
  try {
    const payment = await Payment.findOne({ where: { order_id: req.params.orderId } });
    if (!payment) return res.status(404).json({ error: 'Paiement introuvable' });
    res.json({ payment });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: Confirm payment received (manual verification)
router.put('/:id/confirm', requireAuth, requireAdmin, async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Paiement introuvable' });

    payment.status = 'confirmed';
    payment.confirmed_at = new Date();
    payment.confirmed_by = req.user.sub;
    payment.notes = req.body.notes || 'Paiement confirmé par admin';
    payment.reference = req.body.reference || payment.reference;
    await payment.save();

    // Auto-update order status to confirmed
    const order = await Order.findByPk(payment.order_id);
    if (order && order.status === 'pending') {
      const history = Array.isArray(order.status_history) ? [...order.status_history] : [];
      history.push({ status: 'confirmed', timestamp: new Date().toISOString(), note: 'Paiement confirmé' });
      order.status = 'confirmed';
      order.payment_status = 'confirmed';
      order.status_history = history;
      await order.save();
    }

    res.json({ payment, message: 'Paiement confirmé avec succès' });
  } catch (err) {
    console.error('confirm payment error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: Reject payment
router.put('/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Paiement introuvable' });

    payment.status = 'failed';
    payment.notes = req.body.reason || 'Paiement rejeté';
    await payment.save();

    res.json({ payment, message: 'Paiement rejeté' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
