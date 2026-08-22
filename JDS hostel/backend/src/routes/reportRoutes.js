const express = require('express')
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware')
const { getReportSummary } = require('../controllers/reportController')
const router = express.Router()
router.get('/summary', authenticate, authorizeRoles('admin', 'superadmin'), getReportSummary)
module.exports = router
