const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { newsValidation } = require('../middleware/validation');
const newsController = require('../controllers/newsController');

// Public routes
router.get('/', newsController.getNews);
router.get('/:id', newsController.getNewsById);

// Protected routes (admin only - you can add admin middleware later)
router.post('/', authenticateToken, newsValidation, newsController.createNews);
router.put('/:id', authenticateToken, newsValidation, newsController.updateNews);
router.delete('/:id', authenticateToken, newsController.deleteNews);

module.exports = router;
