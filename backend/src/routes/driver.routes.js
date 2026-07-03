import { Router } from 'express';
import { Driver } from '../models/index.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';

const router = Router();

// List all drivers
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const drivers = await Driver.findAll({ order: [['name', 'ASC']] });
    res.json({ drivers });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create driver
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, phone, vehicle, avatar, is_available } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Nom et téléphone requis' });
    const driver = await Driver.create({
      name, phone, vehicle: vehicle || 'Moto', avatar: avatar || '🏍️',
      is_available: is_available !== false, rating: 4.5,
      current_lat: -12.2795 + (Math.random() - 0.5) * 0.02,
      current_lng: 49.2913 + (Math.random() - 0.5) * 0.02,
    });
    res.status(201).json({ driver });
  } catch (err) {
    console.error('Create driver error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Update driver
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ error: 'Livreur introuvable' });
    const fields = ['name', 'phone', 'vehicle', 'avatar', 'is_available'];
    fields.forEach(f => { if (req.body[f] !== undefined) driver[f] = req.body[f]; });
    await driver.save();
    res.json({ driver });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Delete driver
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ error: 'Livreur introuvable' });
    await driver.destroy();
    res.json({ message: 'Livreur supprimé' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
