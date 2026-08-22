const mongoose = require('mongoose')

const messMenuSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    day: { type: String, required: true, trim: true },
    breakfast: { type: String, trim: true },
    lunch: { type: String, trim: true },
    eveningSnacks: { type: String, trim: true },
    dinner: { type: String, trim: true },
    specialNote: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  },
  { timestamps: true },
)

messMenuSchema.index({ date: 1 }, { unique: true })

module.exports = mongoose.model('MessMenu', messMenuSchema)