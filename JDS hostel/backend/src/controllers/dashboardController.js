const Student = require('../models/Student')
const Room = require('../models/Room')
const Bed = require('../models/Bed')
const Fee = require('../models/Fee')
const Payment = require('../models/Payment')
const Complaint = require('../models/Complaint')

function monthBounds(offset = 0) {
  const start = new Date()
  start.setDate(1)
  start.setHours(0, 0, 0, 0)
  start.setMonth(start.getMonth() + offset)
  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)
  return { start, end }
}

function percentageChange(current, previous) {
  if (previous === 0) return current === 0 ? null : null
  return ((current - previous) / previous) * 100
}

function round(value) {
  return Math.round(value * 100) / 100
}

async function getDashboard(request, response, next) {
  try {
    const current = monthBounds(0)
    const previous = monthBounds(-1)

    const [
      totalStudents,
      newStudentsThisMonth,
      totalRooms,
      occupiedBeds,
      availableBeds,
      maintenanceBeds,
      expectedThisMonth,
      pendingFees,
      overdueFees,
      currentPayments,
      previousPayments,
      recentStudents,
      recentPayments,
      recentComplaints,
      floorOccupancy,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ joiningDate: { $gte: current.start, $lt: current.end } }),
      Room.countDocuments(),
      Bed.countDocuments({ status: 'occupied' }),
      Bed.countDocuments({ status: 'available' }),
      Bed.countDocuments({ status: 'maintenance' }),
      Fee.aggregate([
        { $match: { dueDate: { $gte: current.start, $lt: current.end } } },
        { $group: { _id: null, amount: { $sum: '$amount' } } },
      ]),
      Fee.aggregate([
        { $match: { status: { $in: ['pending', 'partial'] }, remainingAmount: { $gt: 0 } } },
        { $group: { _id: null, amount: { $sum: '$remainingAmount' }, students: { $addToSet: '$student' } } },
      ]),
      Fee.aggregate([
        { $match: { status: 'overdue', remainingAmount: { $gt: 0 } } },
        { $group: { _id: null, amount: { $sum: '$remainingAmount' } } },
      ]),
      Payment.aggregate([
        { $match: { paymentDate: { $gte: current.start, $lt: current.end } } },
        { $group: { _id: null, amount: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { paymentDate: { $gte: previous.start, $lt: previous.end } } },
        { $group: { _id: null, amount: { $sum: '$amount' } } },
      ]),
      Student.find().select('name studentId room isActive createdAt').populate('room', 'roomNumber').sort({ createdAt: -1 }).limit(4).lean(),
      Payment.find().populate('student', 'name studentId').sort({ paymentDate: -1 }).limit(4).lean(),
      Complaint.find({ status: { $in: ['pending', 'inProgress'] } }).populate('student', 'name room').sort({ createdAt: -1 }).limit(4).lean(),
      Bed.aggregate([
        { $group: { _id: '$room', occupied: { $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] } }, capacity: { $sum: 1 } } },
        { $lookup: { from: 'rooms', localField: '_id', foreignField: '_id', as: 'room' } },
        { $unwind: '$room' },
        { $group: { _id: '$room.floor', occupied: { $sum: '$occupied' }, capacity: { $sum: '$capacity' } } },
        { $sort: { _id: 1 } },
      ]),
    ])

    const collected = currentPayments[0]?.amount || 0
    const previousCollected = previousPayments[0]?.amount || 0
    const expected = expectedThisMonth[0]?.amount || 0
    const pending = pendingFees[0]?.amount || 0
    const pendingStudents = pendingFees[0]?.students?.length || 0
    const overdue = overdueFees[0]?.amount || 0
    const totalBeds = occupiedBeds + availableBeds + maintenanceBeds
    const occupancyPercent = totalBeds ? round((occupiedBeds / totalBeds) * 100) : 0
    const revenueChange = percentageChange(collected, previousCollected)

    const feeTotal = collected + pending + overdue
    const feeOverview = [
      { label: 'Collected', amount: collected, tone: 'teal', width: feeTotal ? round((collected / feeTotal) * 100) : 0 },
      { label: 'Pending', amount: pending, tone: 'amber', width: feeTotal ? round((pending / feeTotal) * 100) : 0 },
      { label: 'Overdue', amount: overdue, tone: 'rose', width: feeTotal ? round((overdue / feeTotal) * 100) : 0 },
    ]

    const formatStudent = (student) => ({
      initials: student.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
      name: student.name,
      detail: `${student.studentId}${student.room?.roomNumber ? ` · Room ${student.room.roomNumber}` : ''}`,
      status: student.isActive ? 'Active' : 'Inactive',
      tone: student.isActive ? 'green' : 'amber',
    })

    const formatPayment = (payment) => ({
      name: payment.student?.name || 'Unknown student',
      date: payment.paymentDate,
      method: payment.paymentMethod,
      amount: payment.amount,
      receipt: payment.receiptNumber || payment.transactionId || 'No receipt',
    })

    const formatComplaint = (complaint) => ({
      title: complaint.title,
      student: complaint.student?.name || 'Unknown student',
      createdAt: complaint.createdAt,
      priority: complaint.priority,
      tone: complaint.priority === 'urgent' || complaint.priority === 'high' ? 'rose' : complaint.priority === 'medium' ? 'amber' : 'blue',
    })

    return response.json({
      success: true,
      stats: {
        totalStudents,
        newStudentsThisMonth,
        totalRooms,
        occupiedBeds,
        availableBeds,
        maintenanceBeds,
        occupancyPercent,
        pendingFees: pending,
        pendingFeeStudents: pendingStudents,
        monthlyRevenue: collected,
        revenueChange: revenueChange === null ? null : round(revenueChange),
        pendingComplaints: await Complaint.countDocuments({ status: { $in: ['pending', 'inProgress'] } }),
      },
      feeCollection: { expected, collected, pending, overdue, feeOverview },
      occupancy: floorOccupancy.map((item) => ({ label: item._id === 0 ? 'Ground floor' : `${['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'][item._id - 1] || `${item._id}th`} floor`, occupied: item.occupied, capacity: item.capacity })),
      recentStudents: recentStudents.map(formatStudent),
      recentPayments: recentPayments.map(formatPayment),
      recentComplaints: recentComplaints.map(formatComplaint),
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = { getDashboard }
