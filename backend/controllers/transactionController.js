const Transaction = require('../models/Transaction');
const User = require('../models/User');
const mongoose = require('mongoose');

const getTransactions = async (req, res) => {
  try {

    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


const addTransaction = async (req, res) => {
  const { type, category, amount, description } = req.body;
  const userId = req.user.id;

  if (!type || !category || !amount) {
    return res.status(400).json({ message: 'Please include type, category, and amount' });
  }

  try {
    const newTransaction = await Transaction.create({
      user: userId,
      type,
      category,
      amount,
      description: description || '',
    });


    let updateFields = {};
    const numericAmount = parseFloat(amount);

    if (type === 'Income') {
      updateFields = {
        $inc: {
          totalIncome: numericAmount,

          totalBalance: numericAmount
        }
      };
    } else if (type === 'Expense') {
      updateFields = {
        $inc: {
          totalExpenses: numericAmount,

          totalBalance: -numericAmount
        }
      };
    }

    await User.findByIdAndUpdate(userId, updateFields, { new: true });


    res.status(201).json({
      message: 'Transaction added and user balance updated',
      transaction: newTransaction
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


const getAnalytics = async (req, res) => {
  try {

    const userId = new mongoose.Types.ObjectId(req.user.id);

    const analytics = await Transaction.aggregate([
      {

        $match: {
          user: userId,
          type: 'Expense'
        }
      },
      {

        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {

        $sort: { totalSpent: -1 }
      }
    ]);



    res.status(200).json(analytics);

  } catch (error) {

    console.error('Analytics Aggregation Error:', error);
    res.status(500).json({ message: 'Server Error during analytics aggregation', error: error.message });
  }
};
module.exports = {
  getTransactions,
  addTransaction,
  getAnalytics,
};