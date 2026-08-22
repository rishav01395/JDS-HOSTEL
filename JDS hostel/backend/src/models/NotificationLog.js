const mongoose = require('mongoose')
const notificationLogSchema = new mongoose.Schema({
  type: { type: String, enum: ['sms', 'email'], required: true },
  recipient: String,
  message: String,
  status: { type: String, enum: ['sent', 'failed', 'skipped'], required: true },
  error: String,
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
}, { timestamps: true })
module.exports = mongoose.model('NotificationLog', notificationLogSchema)
