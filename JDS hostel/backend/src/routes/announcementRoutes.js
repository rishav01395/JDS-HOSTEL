const express = require('express')
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware')
const { createAnnouncement, deleteAnnouncement, listAnnouncements, updateAnnouncement } = require('../controllers/announcementController')
const router = express.Router()
const adminOnly = [authenticate, authorizeRoles('admin', 'superadmin')]
router.get('/', ...adminOnly, listAnnouncements)
router.post('/', ...adminOnly, createAnnouncement)
router.put('/:id', ...adminOnly, updateAnnouncement)
router.delete('/:id', ...adminOnly, deleteAnnouncement)
module.exports = router
