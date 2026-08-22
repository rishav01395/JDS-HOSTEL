const express = require('express')
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware')
const { createComplaint, listComplaints, listComplaintStudents, updateComplaint } = require('../controllers/complaintController')

const router = express.Router()
const adminOnly = [authenticate, authorizeRoles('admin', 'superadmin')]

router.get('/students', ...adminOnly, listComplaintStudents)
router.get('/', ...adminOnly, listComplaints)
router.post('/', ...adminOnly, createComplaint)
router.patch('/:id', ...adminOnly, updateComplaint)

module.exports = router
