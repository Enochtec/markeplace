const express = require('express');
const router = express.Router();
const { getUsers, getUserById, toggleUserStatus, deleteUser, getUserStats } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('ADMIN'));

router.get('/', getUsers);
router.get('/stats', getUserStats);
router.get('/:id', getUserById);
router.patch('/:id/toggle-status', toggleUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;
