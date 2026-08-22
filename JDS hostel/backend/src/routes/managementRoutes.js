const express = require('express')
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware')
const { createFee, createPayment, createRoom, listFees, listPayments, listRooms, listStudents, updateBed, updateRoom } = require('../controllers/managementController')
const { getDashboard } = require('../controllers/dashboardController')

const router = express.Router()
const adminOnly = [authenticate, authorizeRoles('admin', 'superadmin')]

router.get('/dashboard', ...adminOnly, getDashboard)
router.get('/rooms', ...adminOnly, listRooms)
router.post('/rooms', ...adminOnly, createRoom)
router.put('/rooms/:id', ...adminOnly, updateRoom)
router.patch('/beds/:id', ...adminOnly, updateBed)
router.get('/students', ...adminOnly, listStudents)
router.get('/fees', ...adminOnly, listFees)
router.post('/fees', ...adminOnly, createFee)
router.get('/payments', ...adminOnly, listPayments)
router.post('/payments', ...adminOnly, createPayment)

module.exports = router