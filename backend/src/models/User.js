import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  phone: { type: DataTypes.STRING(20), unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('customer', 'driver', 'admin', 'superadmin'), defaultValue: 'customer' },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  avatar_url: { type: DataTypes.TEXT },
}, { tableName: 'users' });

export default User;
