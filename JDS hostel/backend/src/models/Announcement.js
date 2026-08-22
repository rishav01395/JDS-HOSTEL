const mongoose = require('mongoose')

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ['general', 'important', 'fee', 'mess', 'maintenance', 'emergency'], default: 'general' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    targetAudience: { type: String, enum: ['all', 'students', 'admins'], default: 'all' },
    isActive: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Announcement', announcementSchema)