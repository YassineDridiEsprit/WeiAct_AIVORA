const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OperationInputUsage = sequelize.define('OperationInputUsage', {
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
  input_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'agricultural_inputs',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  }
}, {
  tableName: 'operation_input_usage'
});

module.exports = OperationInputUsage;
