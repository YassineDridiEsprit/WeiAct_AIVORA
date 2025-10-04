const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Personnel = sequelize.define('Personnel', {
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
  role: {
    type: DataTypes.ENUM('MANAGER', 'TECHNICIAN', 'WORKER', 'SUPERVISOR', 'OTHER'),
    defaultValue: 'WORKER'
  },
  hourly_rate: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false
  }
}, {
  tableName: 'personnel'
});

module.exports = Personnel;
