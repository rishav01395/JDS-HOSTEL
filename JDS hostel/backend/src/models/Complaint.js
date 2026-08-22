const mongoose = require('mongoose')

const complaintSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['room', 'electricity', 'water', 'mess', 'cleanliness', 'maintenance', 'security', 'other'],
      required: true,
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['pending', 'inProgress', 'resolved', 'rejected'], default: 'pending' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    resolution: { type: String, trim: true },
    resolvedAt: { type: Date },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Complaint', complaintSchema)