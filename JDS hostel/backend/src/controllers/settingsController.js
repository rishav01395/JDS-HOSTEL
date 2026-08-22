const bcrypt = require('bcryptjs')
const Admin = require('../models/Admin')
const HostelSetting = require('../models/HostelSetting')

async function getSettings(_request, response, next) {
  try {
    const settings = await HostelSetting.findOne({ key: 'global' }).lean()
    const admin = await Admin.findById(_request.user.id).select('name email phone role profileImage').lean()
    return response.json({ success: true, settings: settings || {}, admin })
  } catch (error) { return next(error) }
}

async function updateSettings(request, response, next) {
  try {
    const allowed = ['hostelName', 'phone', 'email', 'address', 'upiId', 'upiName', 'smsEnabled', 'smsProvider', 'twilioAccountSid', 'twilioAuthToken', 'twilioFromNumber']
    const update = Object.fromEntries(Object.entries(request.body).filter(([key, value]) => allowed.includes(key) && !(key === 'twilioAuthToken' && !String(value || '').trim())))
    const settings = await HostelSetting.findOneAndUpdate({ key: 'global' }, { $set: update, $setOnInsert: { key: 'global' } }, { new: true, upsert: true, runValidators: true }).select('-twilioAuthToken').lean()
    return response.json({ success: true, message: 'Settings saved successfully', settings })
  } catch (error) { return next(error) }
}

async function updateProfile(request, response, next) {
  try {
    const allowed = ['name', 'phone', 'profileImage']
    const update = Object.fromEntries(Object.entries(request.body).filter(([key, value]) => allowed.includes(key) && !(key === 'twilioAuthToken' && !String(value || '').trim())))
    const admin = await Admin.findByIdAndUpdate(request.user.id, update, { new: true, runValidators: true }).select('name email phone role profileImage').lean()
    if (!admin) return response.status(404).json({ success: false, message: 'Admin account not found' })
    return response.json({ success: true, message: 'Profile updated successfully', admin })
  } catch (error) { return next(error) }
}

async function changePassword(request, response, next) {
  try {
    const { currentPassword, newPassword } = request.body
    if (!currentPassword || !newPassword || newPassword.length < 8) return response.status(400).json({ success: false, message: 'Current password and a new password of at least 8 characters are required' })
    const admin = await Admin.findById(request.user.id).select('+password')
    if (!admin || !(await bcrypt.compare(currentPassword, admin.password))) return response.status(400).json({ success: false, message: 'Current password is incorrect' })
    admin.password = await bcrypt.hash(newPassword, 12)
    await admin.save()
    return response.json({ success: true, message: 'Password changed successfully. Please sign in again.' })
  } catch (error) { return next(error) }
}

module.exports = { changePassword, getSettings, updateProfile, updateSettings }
