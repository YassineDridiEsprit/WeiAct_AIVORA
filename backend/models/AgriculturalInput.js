const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AgriculturalInput = sequelize.define('AgriculturalInput', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  farmer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  input_type: {
    type: DataTypes.ENUM('SEED', 'FERTILIZER', 'PESTICIDE', 'FUEL'),
    allowNull: false
  },
  unit: {
    type: DataTypes.ENUM('Kg', 'L', 'Unit', 'Pack', 'Ton'),
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  current_stock: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  minimum_stock_alert: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 10.00
  }
}, {
  tableName: 'agricultural_inputs'
});

module.exports = AgriculturalInput;
