const mongoose = require('mongoose')
const Complaint = require('../models/Complaint')
const Student = require('../models/Student')

function objectId(value, label) {
  if (!mongoose.isValidObjectId(value)) {
    const error = new Error(`Invalid ${label}`)
    error.statusCode = 400
    throw error
  }
  return value
}

async function listComplaints(request, response, next) {
  try {
    const filter = {}
    if (request.query.status) filter.status = request.query.status
    if (request.query.priority) filter.priority = request.query.priority
    if (request.query.category) filter.category = request.query.category
    const complaints = await Complaint.find(filter)
      .populate('student', 'name studentId room')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .lean()
    return response.json({ success: true, complaints })
  } catch (error) { return next(error) }
}

async function createComplaint(request, response, next) {
  try {
    const { student, title, description, category, priority = 'medium' } = request.body
    if (!student || !title || !description || !category) return response.status(400).json({ success: false, message: 'Student, title, description, and category are required' })
    objectId(student, 'student ID')
    const studentRecord = await Student.findOne({ _id: student, isActive: true }).select('_id')
    if (!studentRecord) return response.status(404).json({ success: false, message: 'Active student not found' })
    const complaint = await Complaint.create({ student, title, description, category, priority })
    const populated = await Complaint.findById(complaint._id).populate('student', 'name studentId').lean()
    return response.status(201).json({ success: true, message: 'Complaint created successfully', complaint: populated })
  } catch (error) { return next(error) }
}

async function updateComplaint(request, response, next) {
  try {
    const allowed = ['status', 'priority', 'assignedTo', 'resolution']
    const update = Object.fromEntries(Object.entries(request.body).filter(([key]) => allowed.includes(key)))
    if (update.assignedTo) objectId(update.assignedTo, 'admin ID')
    const complaint = await Complaint.findById(objectId(request.params.id, 'complaint ID'))
    if (!complaint) return response.status(404).json({ success: false, message: 'Complaint not found' })
    Object.assign(complaint, update)
    if (update.status === 'resolved' && !complaint.resolvedAt) complaint.resolvedAt = new Date()
    if (update.status && update.status !== 'resolved') complaint.resolvedAt = undefined
    await complaint.save()
    const populated = await Complaint.findById(complaint._id).populate('student', 'name studentId').populate('assignedTo', 'name email').lean()
    return response.json({ success: true, message: 'Complaint updated successfully', complaint: populated })
  } catch (error) { return next(error) }
}

async function listComplaintStudents(_request, response, next) {
  try {
    const students = await Student.find({ isActive: true }).select('name studentId').sort({ name: 1 }).lean()
    return response.json({ success: true, students })
  } catch (error) { return next(error) }
}

module.exports = { createComplaint, listComplaints, listComplaintStudents, updateComplaint }
