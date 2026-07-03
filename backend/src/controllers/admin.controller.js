import { Op } from 'sequelize';
import { Product, Order, User, Driver, Category } from '../models/index.js';

export async function getDashboard(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalProducts = await Product.count({ where: { status: 'active' } });
    const ordersToday = await Order.count({ where: { created_at: { [Op.gte]: today } } });
    const lowStock = await Product.count({ where: { stock: { [Op.lt]: 10 }, status: 'active' } });

    const deliveredOrders = await Order.findAll({ where: { status: 'delivered' } });
    const revenue = deliveredOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);

    const totalUsers = await User.count({ where: { role: 'customer' } });
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });

    const recentOrders = await Order.findAll({
      order: [['created_at', 'DESC']], limit: 10,
      include: [{ model: User, as: 'customer', attributes: ['id', 'name', 'email'] }],
    });

    const topProducts = await Product.findAll({
      where: { status: 'active' }, order: [['reviews_count', 'DESC']], limit: 5,
    });

    res.json({
      stats: { totalProducts, ordersToday, revenue, lowStock, totalUsers, totalOrders, pendingOrders },
      recentOrders,
      topProducts,
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function listUsers(req, res) {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const where = {};
    if (role) where.role = role;
    const { count, rows } = await User.findAndCountAll({
      where, order: [['created_at', 'DESC']],
      limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit),
      attributes: { exclude: ['password_hash'] },
    });
    res.json({ users: rows, pagination: { total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) } });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function listDrivers(req, res) {
  try {
    const drivers = await Driver.findAll({ order: [['name', 'ASC']] });
    res.json({ drivers });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
