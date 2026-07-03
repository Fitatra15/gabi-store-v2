import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Driver = sequelize.define('Driver', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  phone: { type: DataTypes.STRING(20), allowNull: false },
  vehicle: { type: DataTypes.STRING(50) },
  avatar: { type: DataTypes.STRING(10) },
  rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 4.5 },
  is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
  current_lat: { type: DataTypes.DECIMAL(10, 7) },
  current_lng: { type: DataTypes.DECIMAL(10, 7) },
}, { tableName: 'drivers' });

export default Driver;
