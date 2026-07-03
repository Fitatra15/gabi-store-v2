import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductWeight = sequelize.define('ProductWeight', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  product_id: { type: DataTypes.UUID, allowNull: false },
  label: { type: DataTypes.STRING(50), allowNull: false },
  value: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
  price_multiplier: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
}, { tableName: 'product_weights' });

export default ProductWeight;
