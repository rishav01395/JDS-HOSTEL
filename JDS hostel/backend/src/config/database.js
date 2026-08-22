const mongoose = require('mongoose')

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    console.warn('MONGODB_URI is not configured. Starting without a database connection.')
    return
  }

  try {
    await mongoose.connect(mongoUri)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
  }
}

module.exports = connectDatabase