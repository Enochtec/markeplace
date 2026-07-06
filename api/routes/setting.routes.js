const express = require('express');
const router = express.Router();
const { getSettings, upsertSetting, updateSettings, deleteSetting, getDashboardStats } = require('../controllers/setting.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', getSettings);
router.get('/admin/dashboard', authenticate, authorize('ADMIN'), getDashboardStats);
router.post('/', authenticate, authorize('ADMIN'), upsertSetting);
router.put('/batch', authenticate, authorize('ADMIN'), updateSettings);
router.delete('/:key', authenticate, authorize('ADMIN'), deleteSetting);

module.exports = router;
