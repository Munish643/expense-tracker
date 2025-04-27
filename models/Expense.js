const mongoose = require('mongoose');

// Define the expense schema
const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    default: 'expense'
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Food', 'Transportation', 'Housing', 'Entertainment', 'Utilities', 'Other', 'Income']
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String
  },
  userName: {
    type: String
  }
});

// Check if the model already exists
const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

module.exports = Expense;
