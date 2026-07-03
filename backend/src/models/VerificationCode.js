import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const VerificationCode = sequelize.define('VerificationCode', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false },
  code: { type: DataTypes.STRING(6), allowNull: false },
  type: { type: DataTypes.ENUM('email_verify', 'password_reset'), defaultValue: 'email_verify' },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  used_at: { type: DataTypes.DATE },
}, { tableName: 'verification_codes' });

export default VerificationCode;
