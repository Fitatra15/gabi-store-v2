import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_id: { type: DataTypes.UUID, allowNull: false },
  provider: { type: DataTypes.ENUM('mvola', 'airtel', 'orange', 'cash'), allowNull: false },
  phone_number: { type: DataTypes.STRING(20) },
  reference: { type: DataTypes.STRING(100) },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'confirmed', 'failed', 'refunded'), defaultValue: 'pending' },
  confirmed_at: { type: DataTypes.DATE },
  confirmed_by: { type: DataTypes.UUID },
  notes: { type: DataTypes.TEXT },
}, { tableName: 'payments' });

export default Payment;
