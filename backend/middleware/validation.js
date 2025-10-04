const { body } = require('express-validator');

// Auth validation
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('first_name').trim().isLength({ min: 1, max: 50 }),
  body('last_name').trim().isLength({ min: 1, max: 50 }),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['farmer', 'transporter', 'pressing', 'onh']),
  body('metamask_address').optional().isString().isLength({ min: 10 })
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail()
];

const resetPasswordValidation = [
  body('email').isEmail().normalizeEmail(),
  body('new_password').isLength({ min: 6 }),
  body('confirm_password').custom((value, { req }) => {
    if (value !== req.body.new_password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
];

// Parcel validation
const parcelValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('culture').optional().isIn(['ORANGE', 'POTATO', 'TOMATO', 'LEMON', 'OLIVE', 'PEACH', 'WHEAT', 'BARLEY', 'NONE']),
  body('soil_type').optional().isIn(['clay', 'silt', 'sand', 'loam']),
  body('boundary').isObject().withMessage('Boundary must be a valid object'),
  body('boundary.coordinates').isArray().withMessage('Boundary coordinates must be an array'),
  body('boundary.coordinates.*').isArray().withMessage('Each coordinate must be an array'),
  body('boundary.coordinates.*.*').isNumeric().withMessage('Coordinates must be numeric')
];

// Equipment validation
const equipmentValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('equipment_type').isIn(['TRACTOR', 'HARVESTER', 'PLOW', 'SPRAYER', 'TILLER', 'OTHER']),
  body('hourly_cost').isFloat({ min: 0 })
];

// Personnel validation
const personnelValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('role').isIn(['MANAGER', 'TECHNICIAN', 'WORKER', 'SUPERVISOR', 'OTHER']),
  body('hourly_rate').isFloat({ min: 0 })
];

// Input validation
const inputValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('input_type').isIn(['SEED', 'FERTILIZER', 'PESTICIDE', 'FUEL']),
  body('unit').isIn(['Kg', 'L', 'Unit', 'Pack', 'Ton']),
  body('unit_price').isFloat({ min: 0 }),
  body('current_stock').optional().isFloat({ min: 0 }),
  body('minimum_stock_alert').optional().isFloat({ min: 0 })
];

// Operation validation
const operationValidation = [
  body('operation_type').trim().isLength({ min: 1, max: 100 }).withMessage('Operation type is required and must be less than 100 characters'),
  body('start_date').isISO8601().toDate(),
  body('end_date').isISO8601().toDate(),
  body('notes').optional().trim(),
  body('parcel_ids').optional().isArray().withMessage('Parcel IDs must be an array'),
  body('parcel_ids.*').optional().isInt({ min: 1 }).withMessage('Each parcel ID must be a positive integer'),
  body('personnel_ids').optional().isArray().withMessage('Personnel IDs must be an array'),
  body('personnel_ids.*.id').optional().isInt({ min: 1 }).withMessage('Personnel ID must be a positive integer'),
  body('personnel_ids.*.daily_hours').optional().isFloat({ min: 0.1 }).withMessage('Daily hours must be a positive number'),
  body('equipment_ids').optional().isArray().withMessage('Equipment IDs must be an array'),
  body('equipment_ids.*.id').optional().isInt({ min: 1 }).withMessage('Equipment ID must be a positive integer'),
  body('equipment_ids.*.total_hours').optional().isFloat({ min: 0.1 }).withMessage('Total hours must be a positive number'),
  body('input_ids').optional().isArray().withMessage('Input IDs must be an array'),
  body('input_ids.*.id').optional().isInt({ min: 1 }).withMessage('Input ID must be a positive integer'),
  body('input_ids.*.quantity').optional().isFloat({ min: 0.01 }).withMessage('Quantity must be a positive number')
];

// News validation
const newsValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('content').trim().isLength({ min: 1 }),
  body('image').optional().isURL(),
  body('link').optional().isURL()
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  parcelValidation,
  equipmentValidation,
  personnelValidation,
  inputValidation,
  operationValidation,
  newsValidation
};
