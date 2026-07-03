import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_number: { type: DataTypes.STRING(20), unique: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'in_transit', 'delivered', 'cancelled'), defaultValue: 'pending' },
  subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  delivery_fee: { type: DataTypes.DECIMAL(12, 2), defaultValue: 3000 },
  service_fee: { type: DataTypes.DECIMAL(12, 2), defaultValue: 500 },
  discount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  payment_method: { type: DataTypes.ENUM('mvola', 'airtel', 'orange', 'cash'), defaultValue: 'cash' },
  payment_status: { type: DataTypes.ENUM('pending', 'confirmed', 'failed', 'refunded'), defaultValue: 'pending' },
  delivery_label: { type: DataTypes.STRING(100) },
  delivery_address: { type: DataTypes.TEXT },
  delivery_lat: { type: DataTypes.DECIMAL(10, 7) },
  delivery_lng: { type: DataTypes.DECIMAL(10, 7) },
  customer_phone: { type: DataTypes.STRING(20) },
  driver_id: { type: DataTypes.UUID },
  estimated_delivery: { type: DataTypes.DATE },
  delivered_at: { type: DataTypes.DATE },
  cancelled_at: { type: DataTypes.DATE },
  cancel_reason: { type: DataTypes.TEXT },
  notes: { type: DataTypes.TEXT },
  status_history: { type: DataTypes.JSON, defaultValue: [] },
}, { tableName: 'orders' });

export default Order;
