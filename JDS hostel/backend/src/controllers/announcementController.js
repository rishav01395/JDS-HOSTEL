const mongoose = require('mongoose')
const Announcement = require('../models/Announcement')

async function listAnnouncements(request, response, next) {
  try {
    const filter = request.query.active === 'false' ? { isActive: false } : request.query.active === 'all' ? {} : { isActive: true }
    const announcements = await Announcement.find(filter).populate('createdBy', 'name').sort({ publishedAt: -1 }).lean()
    return response.json({ success: true, announcements })
  } catch (error) { return next(error) }
}

async function createAnnouncement(request, response, next) {
  try {
    const { title, message, type, targetAudience, publishedAt } = request.body
    if (!title || !message) return response.status(400).json({ success: false, message: 'Title and message are required' })
    const announcement = await Announcement.create({ title, message, type, targetAudience, publishedAt, createdBy: request.user.id })
    return response.status(201).json({ success: true, message: 'Announcement published successfully', announcement })
  } catch (error) { return next(error) }
}

async function updateAnnouncement(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ success: false, message: 'Invalid announcement ID' })
    const allowed = ['title', 'message', 'type', 'targetAudience', 'isActive', 'publishedAt']
    const update = Object.fromEntries(Object.entries(request.body).filter(([key]) => allowed.includes(key)))
    const announcement = await Announcement.findByIdAndUpdate(request.params.id, update, { new: true, runValidators: true })
    if (!announcement) return response.status(404).json({ success: false, message: 'Announcement not found' })
    return response.json({ success: true, message: 'Announcement updated successfully', announcement })
  } catch (error) { return next(error) }
}

async function deleteAnnouncement(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ success: false, message: 'Invalid announcement ID' })
    const announcement = await Announcement.findByIdAndDelete(request.params.id)
    if (!announcement) return response.status(404).json({ success: false, message: 'Announcement not found' })
    return response.json({ success: true, message: 'Announcement deleted successfully' })
  } catch (error) { return next(error) }
}

module.exports = { createAnnouncement, deleteAnnouncement, listAnnouncements, updateAnnouncement }
