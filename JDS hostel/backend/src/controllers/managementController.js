const mongoose = require('mongoose')

const Bed = require('../models/Bed')
const Fee = require('../models/Fee')
const Payment = require('../models/Payment')
const Room = require('../models/Room')
const Student = require('../models/Student')
const { sendSms } = require('../services/smsService')

function objectId(value, label) {
  if (!mongoose.isValidObjectId(value)) {
    const error = new Error(`Invalid ${label}`)
    error.statusCode = 400
    throw error
  }
  return value
}

async function listRooms(_request, response, next) {
  try {
    const rooms = await Room.find().sort({ floor: 1, roomNumber: 1 }).lean()
    const beds = await Bed.find().populate('student', 'name studentId').sort({ bedNumber: 1 }).lean()
    return response.json({ success: true, rooms: rooms.map((room) => ({ ...room, beds: beds.filter((bed) => String(bed.room) === String(room._id)) })) })
  } catch (error) { return next(error) }
}

async function createRoom(request, response, next) {
  try {
    const { roomNumber, floor, roomType, capacity, description } = request.body
    if (!roomNumber || floor === undefined || !roomType || !capacity) return response.status(400).json({ success: false, message: 'Room number, floor, type, and capacity are required' })
    const room = await Room.create({ roomNumber, floor, roomType, capacity, description })
    await Bed.insertMany(Array.from({ length: Number(capacity) }, (_, index) => ({ room: room._id, bedNumber: String.fromCharCode(65 + index) })))
    return response.status(201).json({ success: true, message: 'Room created successfully', room })
  } catch (error) { return next(error) }
}

async function updateRoom(request, response, next) {
  try {
    const room = await Room.findByIdAndUpdate(objectId(request.params.id, 'room ID'), request.body, { new: true, runValidators: true })
    if (!room) return response.status(404).json({ success: false, message: 'Room not found' })
    return response.json({ success: true, message: 'Room updated successfully', room })
  } catch (error) { return next(error) }
}

async function updateBed(request, response, next) {
  try {
    const bed = await Bed.findById(objectId(request.params.id, 'bed ID'))
    if (!bed) return response.status(404).json({ success: false, message: 'Bed not found' })
    if (request.body.status === 'occupied' && !bed.student) return response.status(400).json({ success: false, message: 'Assign a student before marking a bed occupied' })
    bed.status = request.body.status || bed.status
    if (request.body.student !== undefined) bed.student = request.body.student ? objectId(request.body.student, 'student ID') : undefined
    if (bed.student && bed.status === 'available') bed.status = 'occupied'
    await bed.save()
    return response.json({ success: true, message: 'Bed updated successfully', bed })
  } catch (error) { return next(error) }
}

async function listStudents(_request, response, next) {
  try { return response.json({ success: true, students: await Student.find({ isActive: true }).select('name studentId email').sort({ name: 1 }) }) } catch (error) { return next(error) }
}

async function listFees(request, response, next) {
  try {
    const filter = request.query.status ? { status: request.query.status } : {}
    const fees = await Fee.find(filter).populate('student', 'name studentId').sort({ dueDate: 1 })
    return response.json({ success: true, fees })
  } catch (error) { return next(error) }
}

async function createFee(request, response, next) {
  try {
    const { student, amount, feeType, dueDate, description } = request.body
    if (!student || amount === undefined || !feeType || !dueDate) return response.status(400).json({ success: false, message: 'Student, amount, fee type, and due date are required' })
    objectId(student, 'student ID')
    const fee = await Fee.create({ student, amount, feeType, dueDate, description, remainingAmount: amount })
    return response.status(201).json({ success: true, message: 'Fee created successfully', fee })
  } catch (error) { return next(error) }
}

async function listPayments(_request, response, next) {
  try {
    const payments = await Payment.find().populate('student', 'name studentId').populate('fee', 'feeType amount').sort({ paymentDate: -1 })
    return response.json({ success: true, payments })
  } catch (error) { return next(error) }
}

async function createPayment(request, response, next) {
  const session = await mongoose.startSession()
  try {
    const { fee, amount, paymentMethod, paymentDate, transactionId, receiptNumber, notes } = request.body
    if (!fee || amount === undefined || !paymentMethod) return response.status(400).json({ success: false, message: 'Fee, amount, and payment method are required' })
    objectId(fee, 'fee ID')
    session.startTransaction()
    const feeRecord = await Fee.findById(fee).session(session)
    if (!feeRecord) return response.status(404).json({ success: false, message: 'Fee not found' })
    if (Number(amount) <= 0 || Number(amount) > feeRecord.remainingAmount) return response.status(400).json({ success: false, message: `Payment must be greater than zero and no more than ₹${feeRecord.remainingAmount}` })
    const payment = await Payment.create([{ student: feeRecord.student, fee, amount, paymentMethod, paymentDate, transactionId, receiptNumber, notes }], { session })
    feeRecord.paidAmount += Number(amount)
    feeRecord.remainingAmount = feeRecord.amount - feeRecord.paidAmount
    feeRecord.status = feeRecord.remainingAmount === 0 ? 'paid' : 'partial'
    feeRecord.paymentDate = paymentDate || new Date()
    await feeRecord.save({ session })
    await session.commitTransaction()
    const student = await Student.findById(feeRecord.student).select('name phone').lean()
    const smsMessage = student ? `JDS Hostel: ₹${Number(amount).toLocaleString('en-IN')} fee payment received. Balance: ₹${Number(feeRecord.remainingAmount).toLocaleString('en-IN')}. Thank you.` : ''
    const sms = student?.phone && smsMessage ? await sendSms({ to: student.phone, message: smsMessage, student: student._id, payment: payment[0]._id }) : { sent: false, skipped: true, reason: 'Student phone number is missing' }
    return response.status(201).json({ success: true, message: sms.sent ? 'Payment recorded and SMS sent successfully' : 'Payment recorded successfully', payment: payment[0], sms })
  } catch (error) { await session.abortTransaction(); return next(error) } finally { session.endSession() }
}

module.exports = { createFee, createPayment, createRoom, listFees, listPayments, listRooms, listStudents, updateBed, updateRoom }