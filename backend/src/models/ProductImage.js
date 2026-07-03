import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductImage = sequelize.define('ProductImage', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  product_id: { type: DataTypes.UUID, allowNull: false },
  url: { type: DataTypes.TEXT, allowNull: false },
  is_primary: { type: DataTypes.BOOLEAN, defaultValue: false },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'product_images' });

export default ProductImage;
