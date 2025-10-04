const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AgriculturalOperation = sequelize.define('AgriculturalOperation', {
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
  operation_type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'agricultural_operations'
});

// Instance methods
AgriculturalOperation.prototype.getTotalDays = function() {
  const start = new Date(this.start_date);
  const end = new Date(this.end_date);
  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

module.exports = AgriculturalOperation;
