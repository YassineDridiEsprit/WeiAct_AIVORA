const { sequelize, User, Personnel, Equipment, AgriculturalInput } = require('../models');
require('dotenv').config();

async function diagnose() {
  console.log('🔍 Farm Management System Diagnostics');
  console.log('=====================================\n');

  try {
    // 1. Test database connection
    console.log('1. Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection: OK\n');

    // 2. Check environment variables
    console.log('2. Checking environment variables...');
    console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'SET' : 'MISSING'}`);
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'MISSING'}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
    console.log(`PORT: ${process.env.PORT || '8000'}\n`);

    // 3. Check database tables
    console.log('3. Checking database tables...');
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log(`Found tables: ${tables.join(', ')}\n`);

    // 4. Sync database models
    console.log('4. Synchronizing database models...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized\n');

    // 5. Check users
    console.log('5. Checking users...');
    const userCount = await User.count();
    console.log(`Total users: ${userCount}`);
    
    if (userCount > 0) {
      const sampleUser = await User.findOne();
      console.log(`Sample user ID: ${sampleUser.id}, Email: ${sampleUser.email}\n`);
    } else {
      console.log('⚠️  No users found. Please register a user first.\n');
    }

    // 6. Test model creation with a sample user
    if (userCount > 0) {
      console.log('6. Testing model creation...');
      const testUser = await User.findOne();
      
      try {
        // Test Personnel creation
        const testPersonnel = await Personnel.create({
          farmer_id: testUser.id,
          name: 'Test Worker',
          role: 'WORKER',
          hourly_rate: 15.00
        });
        console.log(`✅ Personnel creation: OK (ID: ${testPersonnel.id})`);
        await testPersonnel.destroy(); // Clean up
        
        // Test Equipment creation
        const testEquipment = await Equipment.create({
          farmer_id: testUser.id,
          name: 'Test Tractor',
          equipment_type: 'TRACTOR',
          hourly_cost: 25.00
        });
        console.log(`✅ Equipment creation: OK (ID: ${testEquipment.id})`);
        await testEquipment.destroy(); // Clean up
        
        // Test Input creation
        const testInput = await AgriculturalInput.create({
          farmer_id: testUser.id,
          name: 'Test Seeds',
          input_type: 'SEED',
          unit: 'Kg',
          unit_price: 5.50,
          current_stock: 100,
          minimum_stock_alert: 10
        });
        console.log(`✅ Input creation: OK (ID: ${testInput.id})`);
        await testInput.destroy(); // Clean up
        
      } catch (modelError) {
        console.log(`❌ Model creation error: ${modelError.message}`);
        console.log(modelError.stack);
      }
    }

    console.log('\n🎉 Diagnostics completed successfully!');
    console.log('If you see this message, your backend should be working correctly.');
    
  } catch (error) {
    console.log(`❌ Diagnostics failed: ${error.message}`);
    console.log(error.stack);
  } finally {
    await sequelize.close();
  }
}

diagnose();