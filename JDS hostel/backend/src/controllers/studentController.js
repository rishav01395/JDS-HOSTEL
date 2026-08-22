const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

const Student = require('../models/Student')
const Room = require('../models/Room')
const Bed = require('../models/Bed')

const editableFields = [
  'studentId', 'name', 'email', 'phone', 'alternatePhone', 'dateOfBirth', 'gender',
  'address', 'guardianName', 'guardianPhone', 'course', 'college', 'year',
  'room', 'bed', 'joiningDate', 'leavingDate', 'profileImage', 'isActive',
]

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function pickEditableFields(payload) {
  return Object.fromEntries(editableFields.filter((field) => payload[field] !== undefined).map((field) => [field, payload[field]]))
}

async function resolveAllocation(data) {
  if (data.room === '') data.room = undefined
  if (data.bed === '') data.bed = undefined

  if (data.room !== undefined && !mongoose.isValidObjectId(data.room)) {
    const room = await Room.findOne({ roomNumber: String(data.room).trim() }).select('_id')
    if (!room) {
      const error = new Error(`Room "${data.room}" was not found. Use a valid room ID or room number.`)
      error.statusCode = 400
      throw error
    }
    data.room = room._id
  }

  if (data.bed !== undefined && !mongoose.isValidObjectId(data.bed)) {
    const bedFilter = { bedNumber: String(data.bed).trim() }
    if (data.room !== undefined) bedFilter.room = data.room
    const beds = await Bed.find(bedFilter).select('_id').limit(2)
    if (beds.length !== 1) {
      const error = new Error(`Bed "${data.bed}" was not found for the selected room.`)
      error.statusCode = 400
      throw error
    }
    data.bed = beds[0]._id
  }

  if (data.room !== undefined && data.bed !== undefined) {
    const bed = await Bed.findOne({ _id: data.bed, room: data.room }).select('_id')
    if (!bed) {
      const error = new Error('The selected bed does not belong to the selected room.')
      error.statusCode = 400
      throw error
    }
  }
}


async function syncAllocation(studentId, oldBedId, newBedId, isActive = true) {
  if (oldBedId && String(oldBedId) !== String(newBedId || '')) {
    await Bed.findByIdAndUpdate(oldBedId, { $unset: { student: 1 }, $set: { status: 'available' } })
  }
  if (newBedId && isActive) {
    const bed = await Bed.findById(newBedId)
    if (!bed) { const error = new Error('Selected bed not found'); error.statusCode = 400; throw error }
    if (bed.status === 'maintenance') { const error = new Error('Selected bed is under maintenance'); error.statusCode = 400; throw error }
    if (bed.student && String(bed.student) !== String(studentId)) { const error = new Error('Selected bed is already occupied'); error.statusCode = 409; throw error }
    bed.student = studentId
    bed.status = 'occupied'
    await bed.save()
  }
}

function validateEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateStudentDates(data) {
  for (const field of ['dateOfBirth', 'joiningDate', 'leavingDate']) {
    if (data[field] !== undefined && data[field] !== null && Number.isNaN(Date.parse(data[field]))) {
      return `${field} must be a valid date`
    }
  }

  if (data.leavingDate && data.joiningDate && new Date(data.leavingDate) < new Date(data.joiningDate)) {
    return 'Leaving date cannot be before joining date'
  }

  return null
}

function studentQuery(query) {
  const filter = {}

  if (query.search) {
    const search = new RegExp(escapeRegex(query.search.trim()), 'i')
    filter.$or = [{ name: search }, { studentId: search }, { email: search }, { phone: search }]
  }

  if (query.course) filter.course = query.course.trim()
  if (query.year) filter.year = Number(query.year)
  if (query.status === 'active') filter.isActive = true
  if (query.status === 'inactive') filter.isActive = false

  return filter
}

function safeStudentQuery(query) {
  return query.populate('room', 'roomNumber floor roomType').populate('bed', 'bedNumber status')
}

async function getStudents(request, response, next) {
  try {
    const page = Math.max(Number.parseInt(request.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(Number.parseInt(request.query.limit, 10) || 10, 1), 100)
    const filter = studentQuery(request.query)
    const [students, totalStudents] = await Promise.all([
      safeStudentQuery(Student.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)),
      Student.countDocuments(filter),
    ])

    return response.status(200).json({
      success: true,
      students,
      currentPage: page,
      totalPages: Math.ceil(totalStudents / limit),
      totalStudents,
    })
  } catch (error) {
    return next(error)
  }
}

async function getStudent(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ success: false, message: 'Invalid student ID' })
    const student = await safeStudentQuery(Student.findById(request.params.id))
    if (!student) return response.status(404).json({ success: false, message: 'Student not found' })
    return response.status(200).json({ success: true, student })
  } catch (error) {
    return next(error)
  }
}

async function createStudent(request, response, next) {
  try {
    const data = pickEditableFields(request.body)
    const requiredFields = ['studentId', 'name', 'email', 'phone', 'joiningDate']
    const missingField = requiredFields.find((field) => !data[field])
    if (missingField) return response.status(400).json({ success: false, message: `${missingField} is required` })
    if (!validateEmail(data.email)) return response.status(400).json({ success: false, message: 'Please provide a valid email address' })
    const dateError = validateStudentDates(data)
    if (dateError) return response.status(400).json({ success: false, message: dateError })
    await resolveAllocation(data)

    const existingStudent = await Student.findOne({ $or: [{ studentId: data.studentId }, { email: data.email.toLowerCase().trim() }] }).select('studentId email')
    if (existingStudent) return response.status(409).json({ success: false, message: 'Student ID or email already exists' })

    data.email = data.email.toLowerCase().trim()
    const generatedPassword = crypto.randomBytes(32).toString('hex')
    data.password = await bcrypt.hash(generatedPassword, 12)
    const student = await Student.create(data)
    await syncAllocation(student._id, null, data.bed, data.isActive !== false)
    const safeStudent = student.toObject()
    delete safeStudent.password
    return response.status(201).json({ success: true, message: 'Student created successfully', student: safeStudent })
  } catch (error) {
    return next(error)
  }
}

async function updateStudent(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ success: false, message: 'Invalid student ID' })
    const data = pickEditableFields(request.body)
    if (data.email !== undefined) {
      if (!validateEmail(data.email)) return response.status(400).json({ success: false, message: 'Please provide a valid email address' })
      data.email = data.email.toLowerCase().trim()
    }
    const dateError = validateStudentDates(data)
    if (dateError) return response.status(400).json({ success: false, message: dateError })
    await resolveAllocation(data)
    if (data.studentId || data.email) {
      const duplicate = await Student.findOne({ _id: { $ne: request.params.id }, $or: [{ studentId: data.studentId || '__none__' }, { email: data.email || '__none__' }] }).select('_id')
      if (duplicate) return response.status(409).json({ success: false, message: 'Student ID or email already exists' })
    }

    const before = await Student.findById(request.params.id).select('bed isActive')
    if (!before) return response.status(404).json({ success: false, message: 'Student not found' })
    const student = await Student.findByIdAndUpdate(request.params.id, data, { new: true, runValidators: true }).select('-password')
    await syncAllocation(student._id, before.bed, data.bed !== undefined ? data.bed : student.bed, data.isActive !== false && student.isActive !== false)
    return response.status(200).json({ success: true, message: 'Student updated successfully', student })
  } catch (error) {
    return next(error)
  }
}

async function deactivateStudent(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ success: false, message: 'Invalid student ID' })
    const before = await Student.findById(request.params.id).select('bed')
    const student = await Student.findByIdAndUpdate(request.params.id, { isActive: false }, { new: true }).select('-password')
    if (!student) return response.status(404).json({ success: false, message: 'Student not found' })
    await syncAllocation(student._id, before?.bed, null, false)
    return response.status(200).json({ success: true, message: 'Student deactivated successfully', student })
  } catch (error) {
    return next(error)
  }
}

async function updateStudentStatus(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ success: false, message: 'Invalid student ID' })
    if (typeof request.body.isActive !== 'boolean') return response.status(400).json({ success: false, message: 'isActive must be a boolean' })
    const before = await Student.findById(request.params.id).select('bed')
    const student = await Student.findByIdAndUpdate(request.params.id, { isActive: request.body.isActive }, { new: true }).select('-password')
    if (!student) return response.status(404).json({ success: false, message: 'Student not found' })
    await syncAllocation(student._id, request.body.isActive ? null : before?.bed, request.body.isActive ? student.bed : null, request.body.isActive)
    return response.status(200).json({ success: true, message: `Student ${student.isActive ? 'activated' : 'deactivated'} successfully`, student })
  } catch (error) {
    return next(error)
  }
}

async function getStudentStats(request, response, next) {
  try {
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const [totalStudents, activeStudents, inactiveStudents, newStudentsThisMonth] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ isActive: true }),
      Student.countDocuments({ isActive: false }),
      Student.countDocuments({ joiningDate: { $gte: monthStart } }),
    ])
    return response.status(200).json({ success: true, totalStudents, activeStudents, inactiveStudents, newStudentsThisMonth })
  } catch (error) {
    return next(error)
  }
}

module.exports = { createStudent, deactivateStudent, getStudent, getStudentStats, getStudents, updateStudent, updateStudentStatus }