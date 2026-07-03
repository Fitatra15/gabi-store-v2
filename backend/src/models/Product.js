import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  slug: { type: DataTypes.STRING(250), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  short_description: { type: DataTypes.STRING(500) },
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  compare_price: { type: DataTypes.DECIMAL(12, 2) },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  category_id: { type: DataTypes.UUID, allowNull: false },
  vendor: { type: DataTypes.STRING(100) },
  unit: { type: DataTypes.STRING(30), defaultValue: 'pièce' },
  weight: { type: DataTypes.STRING(50) },
  is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: { type: DataTypes.ENUM('active', 'draft', 'out_of_stock'), defaultValue: 'active' },
  discount_pct: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  avg_rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
  reviews_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  tags: { type: DataTypes.JSON, defaultValue: [] },
  has_weight_options: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'products' });

export default Product;
