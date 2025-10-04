const { Personnel } = require('../models');
const { validationResult } = require('express-validator');

const getPersonnel = async (req, res) => {
  try {
    const personnel = await Personnel.findAll({
      where: { farmer_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    res.json(personnel);
  } catch (error) {
    console.error('Get personnel error:', error);
    res.status(500).json({ error: 'Failed to fetch personnel' });
  }
};

const getPersonnelById = async (req, res) => {
  try {
    const { id } = req.params;
    const personnel = await Personnel.findOne({
      where: { id, farmer_id: req.user.id }
    });

    if (!personnel) {
      return res.status(404).json({ error: 'Personnel not found' });
    }

    res.json(personnel);
  } catch (error) {
    console.error('Get personnel error:', error);
    res.status(500).json({ error: 'Failed to fetch personnel' });
  }
};

const createPersonnel = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, role, hourly_rate } = req.body;

    const personnel = await Personnel.create({
      farmer_id: req.user.id,
      name,
      role,
      hourly_rate
    });

    res.status(201).json(personnel);
  } catch (error) {
    console.error('Create personnel error:', error);
    res.status(500).json({ error: 'Failed to create personnel' });
  }
};

const updatePersonnel = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, role, hourly_rate } = req.body;

    const personnel = await Personnel.findOne({
      where: { id, farmer_id: req.user.id }
    });

    if (!personnel) {
      return res.status(404).json({ error: 'Personnel not found' });
    }

    await personnel.update({
      name: name || personnel.name,
      role: role || personnel.role,
      hourly_rate: hourly_rate !== undefined ? hourly_rate : personnel.hourly_rate
    });

    res.json(personnel);
  } catch (error) {
    console.error('Update personnel error:', error);
    res.status(500).json({ error: 'Failed to update personnel' });
  }
};

const deletePersonnel = async (req, res) => {
  try {
    const { id } = req.params;

    const personnel = await Personnel.findOne({
      where: { id, farmer_id: req.user.id }
    });

    if (!personnel) {
      return res.status(404).json({ error: 'Personnel not found' });
    }

    await personnel.destroy();

    res.json({ message: 'Personnel deleted successfully' });
  } catch (error) {
    console.error('Delete personnel error:', error);
    res.status(500).json({ error: 'Failed to delete personnel' });
  }
};

module.exports = {
  getPersonnel,
  getPersonnelById,
  createPersonnel,
  updatePersonnel,
  deletePersonnel
};
