import { Category } from '../models/index.js';

export async function listCategories(req, res) {
  try {
    const categories = await Category.findAll({ order: [['sort_order', 'ASC']] });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function getCategoryBySlug(req, res) {
  try {
    const category = await Category.findOne({ where: { slug: req.params.slug } });
    if (!category) return res.status(404).json({ error: 'Catégorie introuvable' });
    res.json({ category });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
