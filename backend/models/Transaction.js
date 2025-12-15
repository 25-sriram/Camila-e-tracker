const mongoose = require('mongoose');
const { Schema } = mongoose;

const TransactionSchema = new mongoose.Schema({
  user: {

    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {

    type: String,
    enum: ['Income', 'Expense'],
    required: true,
  },
  category: {
    type: String, 
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', TransactionSchema);