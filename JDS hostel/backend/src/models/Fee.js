const mongoose = require('mongoose')

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    amount: { type: Number, required: true, min: 0 },
    feeType: {
      type: String,
      enum: ['monthly', 'admission', 'security', 'electricity', 'mess', 'other'],
      required: true,
    },
    dueDate: { type: Date, required: true },
    paidAmount: { type: Number, default: 0, min: 0 },
    remainingAmount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['pending', 'partial', 'paid', 'overdue'], default: 'pending' },
    paymentDate: { type: Date },
    description: { type: String, trim: true },
  },
  { timestamps: true },
)

feeSchema.path('paidAmount').validate(function validatePaidAmount(value) {
  return value <= this.amount
}, 'Paid amount cannot exceed fee amount')

feeSchema.path('remainingAmount').validate(function validateRemainingAmount(value) {
  return value <= this.amount
}, 'Remaining amount cannot exceed fee amount')

module.exports = mongoose.model('Fee', feeSchema)