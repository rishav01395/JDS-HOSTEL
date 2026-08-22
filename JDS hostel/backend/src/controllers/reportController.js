const Student = require('../models/Student')
const Room = require('../models/Room')
const Bed = require('../models/Bed')
const Fee = require('../models/Fee')
const Payment = require('../models/Payment')
const Complaint = require('../models/Complaint')

async function getReportSummary(_request, response, next) {
  try {
    const [students, rooms, beds, fees, payments, complaints] = await Promise.all([
      Student.countDocuments(), Room.countDocuments(), Bed.countDocuments(),
      Fee.aggregate([{ $group: { _id: null, billed: { $sum: '$amount' }, paid: { $sum: '$paidAmount' }, balance: { $sum: '$remainingAmount' } } }]),
      Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ])
    return response.json({ success: true, summary: { students, rooms, beds, fees: fees[0] || { billed: 0, paid: 0, balance: 0 }, payments: payments[0] || { total: 0, count: 0 }, complaints } })
  } catch (error) { return next(error) }
}

module.exports = { getReportSummary }
