const mongoose = require('mongoose')

const hostelSettingSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'global' },
  hostelName: { type: String, default: 'JDS Hostel' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  upiId: { type: String, default: '' },
  upiName: { type: String, default: 'JDS Hostel' },
  smsEnabled: { type: Boolean, default: false },
  smsProvider: { type: String, enum: ['twilio'], default: 'twilio' },
  twilioAccountSid: { type: String, default: '', select: false },
  twilioAuthToken: { type: String, default: '', select: false },
  twilioFromNumber: { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('HostelSetting', hostelSettingSchema)
