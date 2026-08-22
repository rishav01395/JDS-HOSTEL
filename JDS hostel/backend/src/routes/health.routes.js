const express = require('express')

const router = express.Router()

router.get('/health', (_request, response) => {
  response.json({
    success: true,
    message: 'JDS Hostel Management System API is running',
  })
})

module.exports = router