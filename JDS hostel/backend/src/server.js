require('dotenv').config()

const app = require('./app')
const connectDatabase = require('./config/database')
const ensureBootstrapAdmin = require('./config/bootstrapAdmin')

const port = process.env.PORT || 5000

async function startServer() {
  await connectDatabase()
  await ensureBootstrapAdmin()

  app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`)
  })
}

startServer().catch((error) => {
  console.error('Backend startup failed:', error.message)
  process.exitCode = 1
})