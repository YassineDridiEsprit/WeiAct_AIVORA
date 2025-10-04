const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EquipmentUsage = sequelize.define('EquipmentUsage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  operation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'agricultural_operations',
      key: 'id'
    }
  },
  equipment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipment',
      key: 'id'
    }
  },
  total_hours: {
    type: DataTypes.DECIMAL(7, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  }
}, {
  tableName: 'equipment_usage',
  indexes: [
    {
      unique: true,
      fields: ['operation_id', 'equipment_id']
    }
  ]
});

module.exports = EquipmentUsage;
