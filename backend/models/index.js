const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const Parcel = require('./Parcel');
const Equipment = require('./Equipment');
const Personnel = require('./Personnel');
const AgriculturalInput = require('./AgriculturalInput');
const AgriculturalOperation = require('./AgriculturalOperation');
const PersonnelWork = require('./PersonnelWork');
const EquipmentUsage = require('./EquipmentUsage');
const OperationInputUsage = require('./OperationInputUsage');
const News = require('./News');

// Define associations
User.hasMany(Parcel, { foreignKey: 'farmer_id', as: 'parcels' });
Parcel.belongsTo(User, { foreignKey: 'farmer_id', as: 'user' });

User.hasMany(Equipment, { foreignKey: 'farmer_id', as: 'equipment' });
Equipment.belongsTo(User, { foreignKey: 'farmer_id', as: 'user' });

User.hasMany(Personnel, { foreignKey: 'farmer_id', as: 'personnel' });
Personnel.belongsTo(User, { foreignKey: 'farmer_id', as: 'user' });

User.hasMany(AgriculturalInput, { foreignKey: 'farmer_id', as: 'inputs' });
AgriculturalInput.belongsTo(User, { foreignKey: 'farmer_id', as: 'user' });

User.hasMany(AgriculturalOperation, { foreignKey: 'farmer_id', as: 'operations' });
AgriculturalOperation.belongsTo(User, { foreignKey: 'farmer_id', as: 'user' });

// Many-to-many relationships through junction tables
AgriculturalOperation.belongsToMany(Parcel, {
  through: 'operation_parcels',
  foreignKey: 'operation_id',
  otherKey: 'parcel_id',
  as: 'parcels'
});

Parcel.belongsToMany(AgriculturalOperation, {
  through: 'operation_parcels',
  foreignKey: 'parcel_id',
  otherKey: 'operation_id',
  as: 'operations'
});

AgriculturalOperation.belongsToMany(Personnel, {
  through: PersonnelWork,
  foreignKey: 'operation_id',
  otherKey: 'personnel_id',
  as: 'personnel'
});

Personnel.belongsToMany(AgriculturalOperation, {
  through: PersonnelWork,
  foreignKey: 'personnel_id',
  otherKey: 'operation_id',
  as: 'operations'
});

AgriculturalOperation.belongsToMany(Equipment, {
  through: EquipmentUsage,
  foreignKey: 'operation_id',
  otherKey: 'equipment_id',
  as: 'equipment'
});

Equipment.belongsToMany(AgriculturalOperation, {
  through: EquipmentUsage,
  foreignKey: 'equipment_id',
  otherKey: 'operation_id',
  as: 'operations'
});

AgriculturalOperation.belongsToMany(AgriculturalInput, {
  through: OperationInputUsage,
  foreignKey: 'operation_id',
  otherKey: 'input_id',
  as: 'inputs'
});

AgriculturalInput.belongsToMany(AgriculturalOperation, {
  through: OperationInputUsage,
  foreignKey: 'input_id',
  otherKey: 'operation_id',
  as: 'operations'
});

// Direct relationships for junction tables
PersonnelWork.belongsTo(AgriculturalOperation, { foreignKey: 'operation_id', as: 'operation' });
PersonnelWork.belongsTo(Personnel, { foreignKey: 'personnel_id', as: 'personnel' });

EquipmentUsage.belongsTo(AgriculturalOperation, { foreignKey: 'operation_id', as: 'operation' });
EquipmentUsage.belongsTo(Equipment, { foreignKey: 'equipment_id', as: 'equipment' });

OperationInputUsage.belongsTo(AgriculturalOperation, { foreignKey: 'operation_id', as: 'operation' });
OperationInputUsage.belongsTo(AgriculturalInput, { foreignKey: 'input_id', as: 'input' });

module.exports = {
  sequelize,
  User,
  Parcel,
  Equipment,
  Personnel,
  AgriculturalInput,
  AgriculturalOperation,
  PersonnelWork,
  EquipmentUsage,
  OperationInputUsage,
  News
};
