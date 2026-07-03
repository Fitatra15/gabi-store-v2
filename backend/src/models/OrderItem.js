import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_id: { type: DataTypes.UUID, allowNull: false },
  product_id: { type: DataTypes.UUID, allowNull: false },
  product_weight_id: { type: DataTypes.UUID },
  name: { type: DataTypes.STRING(200), allowNull: false },
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  weight_label: { type: DataTypes.STRING(50) },
  image_url: { type: DataTypes.TEXT },
  total_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
}, { tableName: 'order_items' });

export default OrderItem;
