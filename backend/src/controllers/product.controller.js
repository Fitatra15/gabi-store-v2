import { Op } from 'sequelize';
import { Product, Category, ProductImage, ProductWeight, Review, User } from '../models/index.js';

export async function listProducts(req, res) {
  try {
    const { category, tags, search, q, promo, min_price, max_price, sort, page = 1, limit = 20, featured } = req.query;
    const where = { status: 'active' };
    const order = [];

    if (category) {
      const cat = await Category.findOne({ where: { slug: category } });
      if (cat) where.category_id = cat.id;
    }
    if (search || q) {
      const term = `%${(search || q).toLowerCase()}%`;
      where[Op.or] = [
        { name: { [Op.like]: term } },
        { description: { [Op.like]: term } },
        { vendor: { [Op.like]: term } },
      ];
    }
    if (promo === 'true') where.discount_pct = { [Op.gt]: 0 };
    if (featured === 'true') where.is_featured = true;
    if (min_price) where.price = { ...where.price, [Op.gte]: parseFloat(min_price) };
    if (max_price) where.price = { ...where.price, [Op.lte]: parseFloat(max_price) };

    switch (sort) {
      case 'price_asc': order.push(['price', 'ASC']); break;
      case 'price_desc': order.push(['price', 'DESC']); break;
      case 'rating': order.push(['avg_rating', 'DESC']); break;
      case 'newest': order.push(['created_at', 'DESC']); break;
      default: order.push(['is_featured', 'DESC'], ['created_at', 'DESC']);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Product.findAndCountAll({
      where, order,
      limit: parseInt(limit), offset,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] },
        { model: ProductImage, as: 'images', attributes: ['id', 'url', 'is_primary', 'sort_order'], separate: true, order: [['sort_order', 'ASC']] },
        { model: ProductWeight, as: 'weight_options', attributes: ['id', 'label', 'value', 'price_multiplier'], separate: true },
      ],
    });

    res.json({
      products: rows,
      pagination: {
        total: count, page: parseInt(page), limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('listProducts error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function getProduct(req, res) {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images', order: [['sort_order', 'ASC']] },
        { model: ProductWeight, as: 'weight_options' },
        { model: Review, as: 'reviews', include: [{ model: User, as: 'author', attributes: ['id', 'name', 'avatar_url'] }], order: [['created_at', 'DESC']], limit: 20 },
      ],
    });
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });

    // Get related products
    const related = await Product.findAll({
      where: { category_id: product.category_id, id: { [Op.ne]: product.id }, status: 'active' },
      limit: 4,
      include: [
        { model: ProductImage, as: 'images', where: { is_primary: true }, required: false },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      ],
    });

    res.json({ product, related });
  } catch (err) {
    console.error('getProduct error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function getFeatured(req, res) {
  try {
    const products = await Product.findAll({
      where: { is_featured: true, status: 'active' }, limit: 12,
      include: [
        { model: ProductImage, as: 'images', separate: true, order: [['sort_order', 'ASC']] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] },
        { model: ProductWeight, as: 'weight_options', separate: true },
      ],
    });
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function createProduct(req, res) {
  try {
    const { name, slug, description, short_description, price, compare_price, stock, category_id, vendor, unit, weight, is_featured, status, tags, has_weight_options, images, weight_options, discount_pct } = req.body;
    if (!name || !price || !category_id) {
      return res.status(400).json({ error: 'Nom, prix et catégorie requis' });
    }
    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product = await Product.create({
      name, slug: productSlug, description, short_description,
      price, compare_price, stock: stock || 0, category_id, vendor, unit, weight,
      is_featured: is_featured || false, status: status || 'active',
      tags: tags || [], has_weight_options: has_weight_options || false,
      discount_pct: discount_pct || 0,
    });

    // Create images
    if (images && images.length > 0) {
      await ProductImage.bulkCreate(images.map((img, i) => ({
        product_id: product.id, url: img.url || img, is_primary: i === 0, sort_order: i,
      })));
    }

    // Create weight options
    if (weight_options && weight_options.length > 0) {
      await ProductWeight.bulkCreate(weight_options.map(wo => ({
        product_id: product.id, label: wo.label, value: wo.value, price_multiplier: wo.price_multiplier,
      })));
    }

    const created = await Product.findByPk(product.id, {
      include: [
        { model: ProductImage, as: 'images' },
        { model: ProductWeight, as: 'weight_options' },
        { model: Category, as: 'category' },
      ],
    });
    res.status(201).json({ product: created });
  } catch (err) {
    console.error('createProduct error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function updateProduct(req, res) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });
    const fields = ['name', 'slug', 'description', 'short_description', 'price', 'compare_price', 'stock', 'category_id', 'vendor', 'unit', 'weight', 'is_featured', 'status', 'tags', 'has_weight_options', 'discount_pct'];
    fields.forEach(f => { if (req.body[f] !== undefined) product[f] = req.body[f]; });
    await product.save();

    if (req.body.images) {
      await ProductImage.destroy({ where: { product_id: product.id } });
      await ProductImage.bulkCreate(req.body.images.map((img, i) => ({
        product_id: product.id, url: img.url || img, is_primary: i === 0, sort_order: i,
      })));
    }
    if (req.body.weight_options) {
      await ProductWeight.destroy({ where: { product_id: product.id } });
      await ProductWeight.bulkCreate(req.body.weight_options.map(wo => ({
        product_id: product.id, label: wo.label, value: wo.value, price_multiplier: wo.price_multiplier,
      })));
    }

    const updated = await Product.findByPk(product.id, {
      include: [{ model: ProductImage, as: 'images' }, { model: ProductWeight, as: 'weight_options' }, { model: Category, as: 'category' }],
    });
    res.json({ product: updated });
  } catch (err) {
    console.error('updateProduct error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function deleteProduct(req, res) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });
    await product.destroy();
    res.json({ message: 'Produit supprimé' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function createReview(req, res) {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Note entre 1 et 5 requise' });
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });

    const review = await Review.create({
      product_id: product.id, user_id: req.user.sub,
      rating, comment, is_verified: true,
    });

    // Update product avg rating
    const reviews = await Review.findAll({ where: { product_id: product.id } });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    product.avg_rating = Math.round(avg * 100) / 100;
    product.reviews_count = reviews.length;
    await product.save();

    const full = await Review.findByPk(review.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'avatar_url'] }],
    });
    res.status(201).json({ review: full });
  } catch (err) {
    console.error('createReview error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
