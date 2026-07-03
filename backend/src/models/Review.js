import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Review = sequelize.define('Review', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  product_id: { type: DataTypes.UUID, allowNull: false },
  user_id: { type: DataTypes.UUID, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'reviews' });

export default Review;
