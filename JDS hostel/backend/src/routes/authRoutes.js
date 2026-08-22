const express = require('express')

const { loginAdmin, loginStudent, registerAdmin } = require('../controllers/authController')
const { authenticate } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/admin/register', registerAdmin)
router.post('/admin/login', loginAdmin)
router.post('/student/login', loginStudent)

router.get('/me', authenticate, (request, response) => {
  response.status(200).json({ success: true, user: request.user })
})

module.exports = router