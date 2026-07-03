import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Wishlist = sequelize.define('Wishlist', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  product_id: { type: DataTypes.UUID, allowNull: false },
}, { tableName: 'wishlists' });

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.STRING(50), defaultValue: 'info' },
  title: { type: DataTypes.STRING(200), allowNull: false },
  body: { type: DataTypes.TEXT },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'notifications' });

export { Wishlist, Notification };
