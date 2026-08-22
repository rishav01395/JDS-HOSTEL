function errorHandler(error, _request, response, _next) {
  console.error(error.stack || error.message)

  if (error.code === 11000) {
    return response.status(409).json({ success: false, message: 'A record with the same unique value already exists' })
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ success: false, message: Object.values(error.errors).map((item) => item.message).join(', ') })
  }

  if (error.name === 'CastError') {
    return response.status(400).json({ success: false, message: 'Invalid value provided' })
  }

  return response.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : 'Internal server error',
  })
}

module.exports = errorHandler