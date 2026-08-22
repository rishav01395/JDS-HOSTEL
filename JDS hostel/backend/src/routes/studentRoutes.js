const express = require('express')

const {
  createStudent, deactivateStudent, getStudent, getStudentStats, getStudents, updateStudent, updateStudentStatus,
} = require('../controllers/studentController')
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware')

const router = express.Router()
const adminOnly = [authenticate, authorizeRoles('admin', 'superadmin')]

router.get('/stats/summary', ...adminOnly, getStudentStats)
router.get('/', ...adminOnly, getStudents)
router.post('/', ...adminOnly, createStudent)
router.get('/:id', ...adminOnly, getStudent)
router.put('/:id', ...adminOnly, updateStudent)
router.delete('/:id', ...adminOnly, deactivateStudent)
router.patch('/:id/status', ...adminOnly, updateStudentStatus)

module.exports = router