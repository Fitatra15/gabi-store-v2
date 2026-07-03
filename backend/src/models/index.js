import sequelize from '../config/database.js';
import User from './User.js';
import Category from './Category.js';
import Product from './Product.js';
import ProductImage from './ProductImage.js';
import ProductWeight from './ProductWeight.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Review from './Review.js';
import RefreshToken from './RefreshToken.js';
import Driver from './Driver.js';
import Promotion from './Promotion.js';
import { Wishlist, Notification } from './Extras.js';
import VerificationCode from './VerificationCode.js';
import Payment from './Payment.js';

// ─── Associations ───
// Category <-> Product
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Product <-> Images
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id' });

// Product <-> Weights
Product.hasMany(ProductWeight, { foreignKey: 'product_id', as: 'weight_options', onDelete: 'CASCADE' });
ProductWeight.belongsTo(Product, { foreignKey: 'product_id' });

// Product <-> Reviews
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'product_id' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// User <-> Orders
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'customer' });

// Order <-> OrderItems
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Order <-> Driver
Order.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver' });
Driver.hasMany(Order, { foreignKey: 'driver_id' });

// User <-> RefreshTokens
User.hasMany(RefreshToken, { foreignKey: 'user_id', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

// Wishlist
User.belongsToMany(Product, { through: Wishlist, foreignKey: 'user_id', otherKey: 'product_id', as: 'wishlist' });
Product.belongsToMany(User, { through: Wishlist, foreignKey: 'product_id', otherKey: 'user_id', as: 'wishedBy' });

// Notifications
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// VerificationCode
User.hasMany(VerificationCode, { foreignKey: 'user_id', onDelete: 'CASCADE' });
VerificationCode.belongsTo(User, { foreignKey: 'user_id' });

// Payment <-> Order
Order.hasOne(Payment, { foreignKey: 'order_id', as: 'payment', onDelete: 'CASCADE' });
Payment.belongsTo(Order, { foreignKey: 'order_id' });

export {
  sequelize,
  User,
  Category,
  Product,
  ProductImage,
  ProductWeight,
  Order,
  OrderItem,
  Review,
  RefreshToken,
  Driver,
  Promotion,
  Wishlist,
  Notification,
  VerificationCode,
  Payment,
};
