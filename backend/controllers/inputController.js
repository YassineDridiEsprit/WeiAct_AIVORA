const { AgriculturalInput } = require('../models');
const { validationResult } = require('express-validator');

const getInputs = async (req, res) => {
  try {
    const inputs = await AgriculturalInput.findAll({
      where: { farmer_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    res.json(inputs);
  } catch (error) {
    console.error('Get inputs error:', error);
    res.status(500).json({ error: 'Failed to fetch inputs' });
  }
};

const getInputById = async (req, res) => {
  try {
    const { id } = req.params;
    const input = await AgriculturalInput.findOne({
      where: { id, farmer_id: req.user.id }
    });

    if (!input) {
      return res.status(404).json({ error: 'Input not found' });
    }

    res.json(input);
  } catch (error) {
    console.error('Get input error:', error);
    res.status(500).json({ error: 'Failed to fetch input' });
  }
};

const createInput = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, input_type, unit, unit_price, current_stock, minimum_stock_alert } = req.body;

    const input = await AgriculturalInput.create({
      farmer_id: req.user.id,
      name,
      input_type,
      unit,
      unit_price,
      current_stock: current_stock || 0,
      minimum_stock_alert: minimum_stock_alert || 10.00
    });

    res.status(201).json(input);
  } catch (error) {
    console.error('Create input error:', error);
    res.status(500).json({ error: 'Failed to create input' });
  }
};

const updateInput = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, input_type, unit, unit_price, current_stock, minimum_stock_alert } = req.body;

    const input = await AgriculturalInput.findOne({
      where: { id, farmer_id: req.user.id }
    });

    if (!input) {
      return res.status(404).json({ error: 'Input not found' });
    }

    await input.update({
      name: name || input.name,
      input_type: input_type || input.input_type,
      unit: unit || input.unit,
      unit_price: unit_price !== undefined ? unit_price : input.unit_price,
      current_stock: current_stock !== undefined ? current_stock : input.current_stock,
      minimum_stock_alert: minimum_stock_alert !== undefined ? minimum_stock_alert : input.minimum_stock_alert
    });

    res.json(input);
  } catch (error) {
    console.error('Update input error:', error);
    res.status(500).json({ error: 'Failed to update input' });
  }
};

const deleteInput = async (req, res) => {
  try {
    const { id } = req.params;

    const input = await AgriculturalInput.findOne({
      where: { id, farmer_id: req.user.id }
    });

    if (!input) {
      return res.status(404).json({ error: 'Input not found' });
    }

    await input.destroy();

    res.json({ message: 'Input deleted successfully' });
  } catch (error) {
    console.error('Delete input error:', error);
    res.status(500).json({ error: 'Failed to delete input' });
  }
};

const getLowStockInputs = async (req, res) => {
  try {
    const inputs = await AgriculturalInput.findAll({
      where: { 
        farmer_id: req.user.id,
        current_stock: {
          [require('sequelize').Op.lt]: require('sequelize').col('minimum_stock_alert')
        }
      },
      order: [['created_at', 'DESC']]
    });

    res.json(inputs);
  } catch (error) {
    console.error('Get low stock inputs error:', error);
    res.status(500).json({ error: 'Failed to fetch low stock inputs' });
  }
};

module.exports = {
  getInputs,
  getInputById,
  createInput,
  updateInput,
  deleteInput,
  getLowStockInputs
};
