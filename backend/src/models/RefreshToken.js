import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RefreshToken = sequelize.define('RefreshToken', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  token_hash: { type: DataTypes.STRING(255), allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  revoked_at: { type: DataTypes.DATE },
}, { tableName: 'refresh_tokens' });

export default RefreshToken;
