const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  parcelValidation,
  equipmentValidation,
  personnelValidation,
  inputValidation,
  operationValidation
} = require('../middleware/validation');

// Import controllers
const parcelController = require('../controllers/parcelController');
const equipmentController = require('../controllers/equipmentController');
const personnelController = require('../controllers/personnelController');
const inputController = require('../controllers/inputController');
const operationController = require('../controllers/operationController');

// All routes require authentication
router.use(authenticateToken);

// Parcel routes
router.get('/parcels', parcelController.getParcels);
router.get('/parcels/:id', parcelController.getParcel);
router.post('/parcels', parcelValidation, parcelController.createParcel);
router.put('/parcels/:id', parcelValidation, parcelController.updateParcel);
router.delete('/parcels/:id', parcelController.deleteParcel);

// Equipment routes
router.get('/equipment', equipmentController.getEquipment);
router.get('/equipment/:id', equipmentController.getEquipmentById);
router.post('/equipment', equipmentValidation, equipmentController.createEquipment);
router.put('/equipment/:id', equipmentValidation, equipmentController.updateEquipment);
router.delete('/equipment/:id', equipmentController.deleteEquipment);

// Personnel routes
router.get('/personnel', personnelController.getPersonnel);
router.get('/personnel/:id', personnelController.getPersonnelById);
router.post('/personnel', personnelValidation, personnelController.createPersonnel);
router.put('/personnel/:id', personnelValidation, personnelController.updatePersonnel);
router.delete('/personnel/:id', personnelController.deletePersonnel);

// Input routes
router.get('/inputs', inputController.getInputs);
router.get('/inputs/:id', inputController.getInputById);
router.get('/inputs/low-stock', inputController.getLowStockInputs);
router.post('/inputs', inputValidation, inputController.createInput);
router.put('/inputs/:id', inputValidation, inputController.updateInput);
router.delete('/inputs/:id', inputController.deleteInput);

// Operation routes
router.get('/operations', operationController.getOperations);
router.get('/operations/:id', operationController.getOperationById);
router.get('/operations/calendar', operationController.getCalendarOperations);
router.post('/operations', operationValidation, operationController.createOperation);
router.put('/operations/:id', operationValidation, operationController.updateOperation);
router.delete('/operations/:id', operationController.deleteOperation);

module.exports = router;
