const mongoose = require('mongoose')

const bedSchema = new mongoose.Schema(
  {
    bedNumber: { type: String, required: true, trim: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
  },
  { timestamps: true },
)

bedSchema.index({ room: 1, bedNumber: 1 }, { unique: true })

module.exports = mongoose.model('Bed', bedSchema)