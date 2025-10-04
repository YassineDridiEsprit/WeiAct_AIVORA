const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Equipment = sequelize.define('Equipment', {
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
  equipment_type: {
    type: DataTypes.ENUM('TRACTOR', 'HARVESTER', 'PLOW', 'SPRAYER', 'TILLER', 'OTHER'),
    defaultValue: 'OTHER'
  },
  hourly_cost: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false
  }
}, {
  tableName: 'equipment'
});

module.exports = Equipment;
