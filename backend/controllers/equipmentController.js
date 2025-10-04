const { Equipment } = require('../models');
const { validationResult } = require('express-validator');

const getEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findAll({
      where: { farmer_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    res.json(equipment);
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
};

const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findOne({
      where: { id, farmer_id: req.user.id }
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json(equipment);
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
};

const createEquipment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, equipment_type, hourly_cost } = req.body;

    const equipment = await Equipment.create({
      farmer_id: req.user.id,
      name,
      equipment_type,
      hourly_cost
    });

    res.status(201).json(equipment);
  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json({ error: 'Failed to create equipment' });
  }
};

const updateEquipment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, equipment_type, hourly_cost } = req.body;

    const equipment = await Equipment.findOne({
      where: { id, farmer_id: req.user.id }
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    await equipment.update({
      name: name || equipment.name,
      equipment_type: equipment_type || equipment.equipment_type,
      hourly_cost: hourly_cost !== undefined ? hourly_cost : equipment.hourly_cost
    });

    res.json(equipment);
  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
};

const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findOne({
      where: { id, farmer_id: req.user.id }
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    await equipment.destroy();

    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
};

module.exports = {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
};
