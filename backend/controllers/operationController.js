const { 
  AgriculturalOperation, 
  Parcel, 
  Personnel, 
  Equipment, 
  AgriculturalInput,
  PersonnelWork,
  EquipmentUsage,
  OperationInputUsage,
  sequelize
} = require('../models');
const { validationResult } = require('express-validator');

const getOperations = async (req, res) => {
  try {
    const operations = await AgriculturalOperation.findAll({
      where: { farmer_id: req.user.id },
      include: [
        {
          model: Parcel,
          as: 'parcels',
          through: { attributes: [] }
        },
        {
          model: Personnel,
          as: 'personnel',
          through: { attributes: ['daily_hours'] }
        },
        {
          model: Equipment,
          as: 'equipment',
          through: { attributes: ['total_hours'] }
        },
        {
          model: AgriculturalInput,
          as: 'inputs',
          through: { attributes: ['quantity'] }
        }
      ],
      order: [['start_date', 'DESC']]
    });

    res.json(operations);
  } catch (error) {
    console.error('Get operations error:', error);
    res.status(500).json({ error: 'Failed to fetch operations' });
  }
};

const getOperationById = async (req, res) => {
  try {
    const { id } = req.params;
    const operation = await AgriculturalOperation.findOne({
      where: { id, farmer_id: req.user.id },
      include: [
        {
          model: Parcel,
          as: 'parcels',
          through: { attributes: [] }
        },
        {
          model: Personnel,
          as: 'personnel',
          through: { attributes: ['daily_hours'] }
        },
        {
          model: Equipment,
          as: 'equipment',
          through: { attributes: ['total_hours'] }
        },
        {
          model: AgriculturalInput,
          as: 'inputs',
          through: { attributes: ['quantity'] }
        }
      ]
    });

    if (!operation) {
      return res.status(404).json({ error: 'Operation not found' });
    }

    res.json(operation);
  } catch (error) {
    console.error('Get operation error:', error);
    res.status(500).json({ error: 'Failed to fetch operation' });
  }
};

const createOperation = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      operation_type, 
      parcel_ids, 
      personnel_ids, 
      equipment_ids, 
      input_ids,
      start_date, 
      end_date, 
      notes 
    } = req.body;

    // Validate dates
    if (new Date(end_date) < new Date(start_date)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'End date cannot be before start date' });
    }

    // Create operation
    const operation = await AgriculturalOperation.create({
      farmer_id: req.user.id,
      operation_type,
      start_date,
      end_date,
      notes
    }, { transaction });

    // Add parcels
    if (parcel_ids && parcel_ids.length > 0) {
      await operation.setParcels(parcel_ids, { transaction });
    }

    // Add personnel with daily hours
    if (personnel_ids && personnel_ids.length > 0) {
      for (const personnelData of personnel_ids) {
        await PersonnelWork.create({
          operation_id: operation.id,
          personnel_id: personnelData.id,
          daily_hours: personnelData.daily_hours
        }, { transaction });
      }
    }

    // Add equipment with total hours
    if (equipment_ids && equipment_ids.length > 0) {
      for (const equipmentData of equipment_ids) {
        await EquipmentUsage.create({
          operation_id: operation.id,
          equipment_id: equipmentData.id,
          total_hours: equipmentData.total_hours
        }, { transaction });
      }
    }

    // Add inputs with quantities
    if (input_ids && input_ids.length > 0) {
      for (const inputData of input_ids) {
        // Check stock availability
        const input = await AgriculturalInput.findByPk(inputData.id, { transaction });
        if (!input || input.current_stock < inputData.quantity) {
          await transaction.rollback();
          return res.status(400).json({ 
            error: `Not enough stock for ${input?.name || 'input'}. Available: ${input?.current_stock || 0}${input?.unit || ''}` 
          });
        }

        await OperationInputUsage.create({
          operation_id: operation.id,
          input_id: inputData.id,
          quantity: inputData.quantity
        }, { transaction });

        // Update stock
        await input.update({
          current_stock: input.current_stock - inputData.quantity
        }, { transaction });
      }
    }

    await transaction.commit();

    // Fetch the complete operation with relations
    const completeOperation = await AgriculturalOperation.findByPk(operation.id, {
      include: [
        {
          model: Parcel,
          as: 'parcels',
          through: { attributes: [] }
        },
        {
          model: Personnel,
          as: 'personnel',
          through: { attributes: ['daily_hours'] }
        },
        {
          model: Equipment,
          as: 'equipment',
          through: { attributes: ['total_hours'] }
        },
        {
          model: AgriculturalInput,
          as: 'inputs',
          through: { attributes: ['quantity'] }
        }
      ]
    });

    res.status(201).json(completeOperation);
  } catch (error) {
    await transaction.rollback();
    console.error('Create operation error:', error);
    res.status(500).json({ error: 'Failed to create operation' });
  }
};

const updateOperation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { operation_type, start_date, end_date, notes } = req.body;

    const operation = await AgriculturalOperation.findOne({
      where: { id, farmer_id: req.user.id }
    });

    if (!operation) {
      return res.status(404).json({ error: 'Operation not found' });
    }

    await operation.update({
      operation_type: operation_type || operation.operation_type,
      start_date: start_date || operation.start_date,
      end_date: end_date || operation.end_date,
      notes: notes !== undefined ? notes : operation.notes
    });

    res.json(operation);
  } catch (error) {
    console.error('Update operation error:', error);
    res.status(500).json({ error: 'Failed to update operation' });
  }
};

const deleteOperation = async (req, res) => {
  try {
    const { id } = req.params;

    const operation = await AgriculturalOperation.findOne({
      where: { id, farmer_id: req.user.id }
    });

    if (!operation) {
      return res.status(404).json({ error: 'Operation not found' });
    }

    await operation.destroy();

    res.json({ message: 'Operation deleted successfully' });
  } catch (error) {
    console.error('Delete operation error:', error);
    res.status(500).json({ error: 'Failed to delete operation' });
  }
};

const getCalendarOperations = async (req, res) => {
  try {
    const { start, end, parcel, type } = req.query;

    let whereClause = { farmer_id: req.user.id };

    if (start && end) {
      whereClause.start_date = {
        [sequelize.Op.lte]: end
      };
      whereClause.end_date = {
        [sequelize.Op.gte]: start
      };
    }

    if (parcel) {
      whereClause['$parcels.id$'] = parcel;
    }

    if (type) {
      whereClause.operation_type = type;
    }

    const operations = await AgriculturalOperation.findAll({
      where: whereClause,
      include: [
        {
          model: Parcel,
          as: 'parcels',
          through: { attributes: [] }
        },
        {
          model: Personnel,
          as: 'personnel',
          through: { attributes: ['daily_hours'] }
        },
        {
          model: Equipment,
          as: 'equipment',
          through: { attributes: ['total_hours'] }
        }
      ]
    });

    const calendarData = operations.map(op => {
      const endDate = new Date(op.end_date);
      endDate.setDate(endDate.getDate() + 1); // FullCalendar expects exclusive end date

      return {
        id: op.id,
        title: `${op.operation_type.charAt(0).toUpperCase() + op.operation_type.slice(1)} - ${op.parcels[0]?.name || 'No Parcel'}`,
        start: op.start_date,
        end: endDate.toISOString().split('T')[0],
        color: getOperationColor(op.operation_type),
        extendedProps: {
          parcels: op.parcels.map(p => p.name),
          type: op.operation_type,
          personnel: op.personnel.map(p => p.name),
          equipment: op.equipment.map(e => e.name)
        }
      };
    });

    res.json(calendarData);
  } catch (error) {
    console.error('Get calendar operations error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar operations' });
  }
};

const getOperationColor = (operationType) => {
  const colors = {
    'labor': '#4CAF50',
    'treatment': '#F44336',
    'irrigation': '#2196F3',
    'harvest': '#FF9800'
  };
  return colors[operationType] || '#9E9E9E';
};

module.exports = {
  getOperations,
  getOperationById,
  createOperation,
  updateOperation,
  deleteOperation,
  getCalendarOperations
};
