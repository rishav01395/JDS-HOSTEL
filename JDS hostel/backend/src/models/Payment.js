const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    fee: { type: mongoose.Schema.Types.ObjectId, ref: 'Fee', required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'UPI', 'bankTransfer', 'online', 'other'],
      required: true,
    },
    transactionId: { type: String, unique: true, sparse: true, trim: true },
    paymentDate: { type: Date, default: Date.now },
    receiptNumber: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Payment', paymentSchema)