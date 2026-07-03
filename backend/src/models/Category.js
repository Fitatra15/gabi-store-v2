import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Category = sequelize.define('Category', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  slug: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  icon: { type: DataTypes.STRING(10) },
  description: { type: DataTypes.TEXT },
  image_url: { type: DataTypes.TEXT },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'categories' });

export default Category;
