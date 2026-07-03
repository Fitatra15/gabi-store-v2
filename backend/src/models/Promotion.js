import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Promotion = sequelize.define('Promotion', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  type: { type: DataTypes.ENUM('product', 'category', 'global'), allowNull: false },
  target_id: { type: DataTypes.UUID },
  discount_pct: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
  label: { type: DataTypes.STRING(100) },
  valid_from: { type: DataTypes.DATE },
  valid_until: { type: DataTypes.DATE },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'promotions' });

export default Promotion;
