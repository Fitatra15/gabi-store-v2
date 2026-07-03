import { Op } from 'sequelize';
import { Promotion, Product, Category } from '../models/index.js';

export async function listPromotions(req, res) {
  try {
    const promotions = await Promotion.findAll({
      where: { is_active: true },
      order: [['created_at', 'DESC']],
    });
    // Enrich with target info
    const enriched = [];
    for (const promo of promotions) {
      const p = promo.toJSON();
      if (promo.type === 'product' && promo.target_id) {
        const prod = await Product.findByPk(promo.target_id, { attributes: ['id', 'name', 'price'] });
        p.target = prod;
      } else if (promo.type === 'category' && promo.target_id) {
        const cat = await Category.findByPk(promo.target_id, { attributes: ['id', 'name', 'slug'] });
        p.target = cat;
      }
      enriched.push(p);
    }
    res.json({ promotions: enriched });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function createPromotion(req, res) {
  try {
    const { type, target_id, discount_pct, label, valid_from, valid_until } = req.body;
    if (!type || !discount_pct) return res.status(400).json({ error: 'Type et pourcentage requis' });

    const promo = await Promotion.create({
      type, target_id, discount_pct, label: label || `-${discount_pct}%`,
      valid_from: valid_from || new Date(), valid_until, is_active: true,
    });

    // Apply discount to product(s)
    if (type === 'product' && target_id) {
      await Product.update({ discount_pct }, { where: { id: target_id } });
    }
    res.status(201).json({ promotion: promo });
  } catch (err) {
    console.error('createPromotion error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function applyToCategory(req, res) {
  try {
    const { category_id, discount_pct, label } = req.body;
    if (!category_id || !discount_pct) return res.status(400).json({ error: 'Catégorie et pourcentage requis' });

    const category = await Category.findByPk(category_id);
    if (!category) return res.status(404).json({ error: 'Catégorie introuvable' });

    // Create promotion entry
    const promo = await Promotion.create({
      type: 'category', target_id: category_id, discount_pct,
      label: label || `-${discount_pct}% ${category.name}`,
      valid_from: new Date(), is_active: true,
    });

    // Apply to all products in category
    const [updated] = await Product.update(
      { discount_pct },
      { where: { category_id, status: 'active' } }
    );

    res.status(201).json({ promotion: promo, productsUpdated: updated });
  } catch (err) {
    console.error('applyToCategory error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function deletePromotion(req, res) {
  try {
    const promo = await Promotion.findByPk(req.params.id);
    if (!promo) return res.status(404).json({ error: 'Promotion introuvable' });

    // Remove discount from target
    if (promo.type === 'product' && promo.target_id) {
      await Product.update({ discount_pct: 0 }, { where: { id: promo.target_id } });
    } else if (promo.type === 'category' && promo.target_id) {
      await Product.update({ discount_pct: 0 }, { where: { category_id: promo.target_id } });
    }

    promo.is_active = false;
    await promo.save();
    res.json({ message: 'Promotion supprimée' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
