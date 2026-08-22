const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    phone: { type: String, required: true, trim: true },
    alternatePhone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: { type: String, trim: true },
    guardianName: { type: String, trim: true },
    guardianPhone: { type: String, trim: true },
    course: { type: String, trim: true },
    college: { type: String, trim: true },
    year: { type: Number, min: 1 },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    bed: { type: mongoose.Schema.Types.ObjectId, ref: 'Bed' },
    joiningDate: { type: Date, required: true },
    leavingDate: { type: Date },
    profileImage: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Student', studentSchema)