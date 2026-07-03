import { Order, OrderItem, Product, ProductImage, ProductWeight, Driver, User, Payment } from '../models/index.js';
import { Op } from 'sequelize';

function generateOrderNumber() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `GABI-${num}`;
}

export async function createOrder(req, res) {
  try {
    const { items, payment_method, delivery_label, delivery_address, delivery_lat, delivery_lng, customer_phone } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'Le panier est vide' });
    if (!delivery_lat || !delivery_lng) return res.status(400).json({ error: 'Adresse de livraison GPS requise' });
    if (!customer_phone) return res.status(400).json({ error: 'Numéro de téléphone requis' });

    // Validate items and calculate subtotal
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findByPk(item.product_id, {
        include: [{ model: ProductImage, as: 'images', where: { is_primary: true }, required: false }],
      });
      if (!product) return res.status(400).json({ error: `Produit ${item.product_id} introuvable` });
      if (product.stock < item.quantity) return res.status(400).json({ error: `Stock insuffisant pour ${product.name}` });

      let unitPrice = parseFloat(product.price);
      if (product.discount_pct > 0) unitPrice = Math.round(unitPrice * (1 - product.discount_pct / 100));

      let weightLabel = null;
      if (item.weight_id) {
        const pw = await ProductWeight.findByPk(item.weight_id);
        if (pw) {
          unitPrice = Math.round(unitPrice * parseFloat(pw.price_multiplier));
          weightLabel = pw.label;
        }
      }

      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        product_id: product.id,
        product_weight_id: item.weight_id || null,
        name: product.name,
        price: unitPrice,
        quantity: item.quantity,
        weight_label: weightLabel,
        image_url: product.images && product.images[0] ? product.images[0].url : null,
        total_price: totalPrice,
      });

      // Decrement stock
      product.stock = Math.max(0, product.stock - item.quantity);
      await product.save();
    }

    const deliveryFee = 3000;
    const total = subtotal + deliveryFee;

    // Assign random available driver
    const drivers = await Driver.findAll({ where: { is_available: true } });
    const driver = drivers.length > 0 ? drivers[Math.floor(Math.random() * drivers.length)] : null;

    const order = await Order.create({
      order_number: generateOrderNumber(),
      user_id: req.user.sub,
      status: 'pending',
      subtotal, delivery_fee: deliveryFee, service_fee: 0, total,
      payment_method: payment_method || 'cash',
      payment_status: payment_method === 'cash' ? 'pending' : 'pending',
      delivery_label, delivery_address, delivery_lat, delivery_lng,
      customer_phone,
      driver_id: driver ? driver.id : null,
      estimated_delivery: new Date(Date.now() + 45 * 60000),
      status_history: [{ status: 'pending', timestamp: new Date().toISOString(), note: 'Commande reçue' }],
    });

    // Create order items
    for (const oi of orderItems) {
      await OrderItem.create({ ...oi, order_id: order.id });
    }

    // Create payment record for tracking
    await Payment.create({
      order_id: order.id,
      provider: payment_method || 'cash',
      phone_number: customer_phone,
      amount: total,
      status: payment_method === 'cash' ? 'pending' : 'pending',
    });

    const fullOrder = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: Driver, as: 'driver' },
        { model: Payment, as: 'payment' },
      ],
    });

    res.status(201).json({ order: fullOrder });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function listOrders(req, res) {
  try {
    const where = {};
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      where.user_id = req.user.sub;
    }
    const { status, page = 1, limit = 20 } = req.query;
    if (status) where.status = status;

    const { count, rows } = await Order.findAndCountAll({
      where, order: [['created_at', 'DESC']],
      limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit),
      include: [
        { model: OrderItem, as: 'items' },
        { model: Driver, as: 'driver' },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
      ],
    });

    res.json({
      orders: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (err) {
    console.error('listOrders error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function getOrder(req, res) {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: Driver, as: 'driver' },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
      ],
    });
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && order.user_id !== req.user.sub) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { status, note } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'in_transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Statut invalide' });

    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });

    const statusLabels = {
      pending: 'En attente', confirmed: 'Confirmée', preparing: 'En préparation',
      in_transit: 'En livraison', delivered: 'Livrée', cancelled: 'Annulée',
    };

    const history = Array.isArray(order.status_history) ? [...order.status_history] : [];
    history.push({ status, timestamp: new Date().toISOString(), note: note || statusLabels[status] });
    order.status = status;
    order.status_history = history;

    if (status === 'delivered') order.delivered_at = new Date();
    if (status === 'cancelled') { order.cancelled_at = new Date(); order.cancel_reason = note; }

    // Assign driver when in_transit
    if (status === 'in_transit' && !order.driver_id) {
      const drivers = await Driver.findAll({ where: { is_available: true } });
      if (drivers.length > 0) {
        const driver = drivers[Math.floor(Math.random() * drivers.length)];
        order.driver_id = driver.id;
      }
    }

    await order.save();

    const fullOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }, { model: Driver, as: 'driver' }, { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] }],
    });
    res.json({ order: fullOrder });
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
