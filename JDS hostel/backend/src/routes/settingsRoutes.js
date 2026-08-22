const express = require('express')
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware')
const { changePassword, getSettings, updateProfile, updateSettings } = require('../controllers/settingsController')
const router = express.Router()
const adminOnly = [authenticate, authorizeRoles('admin', 'superadmin')]
router.get('/', ...adminOnly, getSettings)
router.put('/', ...adminOnly, updateSettings)
router.put('/profile', ...adminOnly, updateProfile)
router.put('/password', ...adminOnly, changePassword)
module.exports = router
