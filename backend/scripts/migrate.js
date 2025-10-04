const { sequelize } = require('../models');
require('dotenv').config();

const migrate = async () => {
  try {
    console.log('Starting database migration...');
    
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    // Sync all models
    await sequelize.sync({ force: false, alter: true });
    console.log('Database synchronized successfully.');
    
    // Create junction tables for many-to-many relationships
    const queryInterface = sequelize.getQueryInterface();
    
    // Create operation_parcels junction table
    try {
      await queryInterface.createTable('operation_parcels', {
        id: {
          type: 'INTEGER',
          primaryKey: true,
          autoIncrement: true
        },
        operation_id: {
          type: 'INTEGER',
          allowNull: false,
          references: {
            model: 'agricultural_operations',
            key: 'id'
          }
        },
        parcel_id: {
          type: 'INTEGER',
          allowNull: false,
          references: {
            model: 'parcels',
            key: 'id'
          }
        },
        created_at: {
          type: 'DATE',
          allowNull: false,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: 'DATE',
          allowNull: false,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        }
      });
      console.log('Created operation_parcels junction table.');
    } catch (error) {
      if (error.name !== 'SequelizeDatabaseError' || !error.message.includes('already exists')) {
        console.log('operation_parcels table already exists or error:', error.message);
      }
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
