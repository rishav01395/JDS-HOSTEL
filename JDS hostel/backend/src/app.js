const cors = require('cors')
const express = require('express')

const healthRoutes = require('./routes/health.routes')
const authRoutes = require('./routes/authRoutes')
const studentRoutes = require('./routes/studentRoutes')
const managementRoutes = require('./routes/managementRoutes')
const complaintRoutes = require('./routes/complaintRoutes')
const messRoutes = require('./routes/messRoutes')
const settingsRoutes = require('./routes/settingsRoutes')
const announcementRoutes = require('./routes/announcementRoutes')
const reportRoutes = require('./routes/reportRoutes')
const errorHandler = require('./middleware/errorHandler')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/management', managementRoutes)
app.use('/api/complaints', complaintRoutes)
app.use('/api/mess', messRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/reports', reportRoutes)

app.use((_request, response) => {
  response.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

app.use(errorHandler)

module.exports = app