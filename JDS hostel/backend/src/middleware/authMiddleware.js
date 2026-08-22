const jwt = require('jsonwebtoken')

function authenticate(request, response, next) {
  const authorizationHeader = request.headers.authorization
  const token = authorizationHeader && authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice(7)
    : null

  if (!token || !process.env.JWT_SECRET) {
    return response.status(401).json({ success: false, message: 'Authentication required' })
  }

  try {
    request.user = jwt.verify(token, process.env.JWT_SECRET)
    return next()
  } catch (_error) {
    return response.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

function authorizeRoles(...allowedRoles) {
  return (request, response, next) => {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
      return response.status(403).json({ success: false, message: 'Access denied' })
    }

    return next()
  }
}

module.exports = { authenticate, authorizeRoles }