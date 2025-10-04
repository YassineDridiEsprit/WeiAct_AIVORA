const { Parcel } = require('../models');
const { validationResult } = require('express-validator');

const getParcels = async (req, res) => {
  try {
    const parcels = await Parcel.findAll({
      where: { farmer_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    res.json(parcels);
  } catch (error) {
    console.error('Get parcels error:', error);
    res.status(500).json({ error: 'Failed to fetch parcels' });
  }
};

const getParcel = async (req, res) => {
  try {
    const { id } = req.params;
    const parcel = await Parcel.findOne({
      where: { id, farmer_id: req.user.id }
    });

    if (!parcel) {
      return res.status(404).json({ error: 'Parcel not found' });
    }

    res.json(parcel);
  } catch (error) {
    console.error('Get parcel error:', error);
    res.status(500).json({ error: 'Failed to fetch parcel' });
  }
};

const createParcel = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, culture, soil_type, boundary } = req.body;

    // Validate boundary coordinates
    if (!boundary || !boundary.coordinates || !boundary.coordinates[0]) {
      return res.status(400).json({ error: 'Valid boundary coordinates are required' });
    }

    const coords = boundary.coordinates[0];
    if (coords.length < 4) {
      return res.status(400).json({ error: 'At least 4 points are required to form a polygon' });
    }

    // Check if polygon is closed
    if (coords[0][0] !== coords[coords.length - 1][0] || 
        coords[0][1] !== coords[coords.length - 1][1]) {
      return res.status(400).json({ error: 'Polygon must be closed - first and last points must match' });
    }

    const parcel = await Parcel.create({
      farmer_id: req.user.id,
      name,
      culture,
      soil_type,
      boundary
    });

    res.status(201).json(parcel);
  } catch (error) {
    console.error('Create parcel error:', error);
    res.status(500).json({ error: 'Failed to create parcel' });
  }
};

const updateParcel = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, culture, soil_type, boundary } = req.body;

    const parcel = await Parcel.findOne({
      where: { id, farmer_id: req.user.id }
    });

    if (!parcel) {
      return res.status(404).json({ error: 'Parcel not found' });
    }

    // Update parcel
    await parcel.update({
      name: name || parcel.name,
      culture: culture || parcel.culture,
      soil_type: soil_type || parcel.soil_type,
      boundary: boundary || parcel.boundary
    });

    res.json(parcel);
  } catch (error) {
    console.error('Update parcel error:', error);
    res.status(500).json({ error: 'Failed to update parcel' });
  }
};

const deleteParcel = async (req, res) => {
  try {
    const { id } = req.params;

    const parcel = await Parcel.findOne({
      where: { id, farmer_id: req.user.id }
    });

    if (!parcel) {
      return res.status(404).json({ error: 'Parcel not found' });
    }

    await parcel.destroy();

    res.json({ message: 'Parcel deleted successfully' });
  } catch (error) {
    console.error('Delete parcel error:', error);
    res.status(500).json({ error: 'Failed to delete parcel' });
  }
};

module.exports = {
  getParcels,
  getParcel,
  createParcel,
  updateParcel,
  deleteParcel
};
