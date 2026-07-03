import { Sequelize } from 'sequelize';
import config from './env.js';

let sequelize;

if (config.databaseUrl) {
  // Production : PostgreSQL (Render, Railway, etc.)
  sequelize = new Sequelize(config.databaseUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
    logging: false,
    define: { underscored: true, timestamps: true },
  });
} else {
  // Local : SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.db.path,
    logging: false,
    define: { underscored: true, timestamps: true },
  });
}

export default sequelize;
