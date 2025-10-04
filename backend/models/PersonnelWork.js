const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PersonnelWork = sequelize.define('PersonnelWork', {
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
  personnel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'personnel',
      key: 'id'
    }
  },
  daily_hours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  }
}, {
  tableName: 'personnel_work',
  indexes: [
    {
      unique: true,
      fields: ['operation_id', 'personnel_id']
    }
  ]
});

module.exports = PersonnelWork;
