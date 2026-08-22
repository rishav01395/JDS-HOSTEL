const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true, trim: true },
    floor: { type: Number, required: true, min: 0 },
    roomType: {
      type: String,
      enum: ['single', 'double', 'triple', 'fourSharing', 'other'],
      required: true,
    },
    capacity: { type: Number, required: true, min: 1 },
    occupiedBeds: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['available', 'partiallyOccupied', 'full', 'maintenance'],
      default: 'available',
    },
    description: { type: String, trim: true },
  },
  { timestamps: true },
)

roomSchema.path('occupiedBeds').validate(function validateOccupiedBeds(value) {
  return value <= this.capacity
}, 'Occupied beds cannot exceed room capacity')

module.exports = mongoose.model('Room', roomSchema)