const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Admin = require('../models/Admin')
const Student = require('../models/Student')

const passwordMinimumLength = 8

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    const error = new Error('JWT_SECRET is not configured')
    error.statusCode = 500
    throw error
  }

  return process.env.JWT_SECRET
}

function createToken(user, userType) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role || 'student', userType },
    getJwtSecret(),
    { expiresIn: '1d' },
  )
}

function toSafeUser(user, userType) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || 'student',
    userType,
    isActive: user.isActive,
  }
}

async function registerAdmin(request, response, next) {
  try {
    const { name, email, password, phone } = request.body

    if (!name || !email || !password || !phone) {
      return response.status(400).json({ success: false, message: 'Name, email, password, and phone are required' })
    }

    if (!isValidEmail(email)) {
      return response.status(400).json({ success: false, message: 'Please provide a valid email address' })
    }

    if (password.length < passwordMinimumLength) {
      return response.status(400).json({ success: false, message: `Password must be at least ${passwordMinimumLength} characters` })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const existingAdmin = await Admin.findOne({ email: normalizedEmail }).select('_id')

    if (existingAdmin) {
      return response.status(409).json({ success: false, message: 'An account with this email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const admin = await Admin.create({ name, email: normalizedEmail, password: hashedPassword, phone })

    return response.status(201).json({ success: true, admin: toSafeUser(admin, 'admin') })
  } catch (error) {
    return next(error)
  }
}

async function loginAdmin(request, response, next) {
  try {
    const { email, password } = request.body

    if (!email || !password || !isValidEmail(email)) {
      return response.status(400).json({ success: false, message: 'Valid email and password are required' })
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+password')
    const passwordMatches = admin ? await bcrypt.compare(password, admin.password) : false

    if (!admin || !passwordMatches || !admin.isActive) {
      return response.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    return response.status(200).json({
      success: true,
      token: createToken(admin, 'admin'),
      admin: toSafeUser(admin, 'admin'),
    })
  } catch (error) {
    return next(error)
  }
}

async function loginStudent(request, response, next) {
  try {
    const { email, password } = request.body

    if (!email || !password || !isValidEmail(email)) {
      return response.status(400).json({ success: false, message: 'Valid email and password are required' })
    }

    const student = await Student.findOne({ email: email.toLowerCase().trim() }).select('+password')
    const passwordMatches = student ? await bcrypt.compare(password, student.password) : false

    if (!student || !passwordMatches || !student.isActive) {
      return response.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    return response.status(200).json({
      success: true,
      token: createToken(student, 'student'),
      student: toSafeUser(student, 'student'),
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = { loginAdmin, loginStudent, registerAdmin }