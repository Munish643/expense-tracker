const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect } = require('../middlewares/auth');
const mongoose = require('mongoose');
const User = require('../models/user');

// Get all expenses for a user
router.get('/', protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses' });
  }
});

// Get expense statistics for charts
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    
    // Calculate start of current week (Monday)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    // Convert userId to ObjectId for aggregation
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get monthly statistics
    const monthlyStats = await Expense.aggregate([
      { 
        $match: { 
          user: userObjectId,
          date: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: { 
            $dateToString: { 
              format: "%Y-%m-%d", 
              date: "$date"
            } 
          },
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get weekly statistics
    const weeklyStats = await Expense.aggregate([
      { 
        $match: { 
          user: userObjectId,
          date: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: { 
            $dayOfWeek: "$date"
          },
          income: {
            $sum: {
              $cond: [{ $gt: ["$amount", 0] }, "$amount", 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $lt: ["$amount", 0] }, "$amount", 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get category distribution
    const categoryStats = await Expense.aggregate([
      { 
        $match: { 
          user: userObjectId,
          amount: { $lt: 0 }
        }
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { totalAmount: 1 } }
    ]);

    // Get yearly overview
    const yearlyStats = await Expense.aggregate([
      { 
        $match: { 
          user: userObjectId,
          date: { $gte: startOfYear }
        }
      },
      {
        $group: {
          _id: { 
            $month: "$date"
          },
          income: {
            $sum: {
              $cond: [{ $gt: ["$amount", 0] }, "$amount", 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $lt: ["$amount", 0] }, "$amount", 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Ensure we have data for all months in yearly stats
    const completeYearlyStats = Array(12).fill(null).map((_, index) => {
      const monthData = yearlyStats.find(stat => stat._id === index + 1);
      return monthData || {
        _id: index + 1,
        income: 0,
        expense: 0
      };
    });

    // Ensure we have data for all days in weekly stats
    // MongoDB's $dayOfWeek returns 1 (Sunday) to 7 (Saturday)
    // We need to convert to 1 (Monday) to 7 (Sunday) for our chart
    const completeWeeklyStats = Array(7).fill(null).map((_, index) => {
      // Convert from 0-based index (Mon=0) to MongoDB's 1-based dayOfWeek (Mon=2)
      const mongoDay = index === 0 ? 2 : index === 6 ? 1 : index + 2;
      const weekData = weeklyStats.find(stat => stat._id === mongoDay);
      return weekData || {
        _id: index + 1, // 1-7 for Mon-Sun
        income: 0,
        expense: 0
      };
    });

    res.json({
      monthly: monthlyStats || [],
      weekly: completeWeeklyStats,
      categories: categoryStats || [],
      yearly: completeYearlyStats
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Create new expense
router.post('/', protect, async (req, res) => {
  try {
    const { title, amount, category, description, date, type, userName } = req.body;
    
    // Determine the type based on amount if not provided
    const transactionType = type || (amount < 0 ? 'expense' : 'income');
    
    const expense = await Expense.create({
      title,
      amount,
      type: transactionType,
      category: category || (transactionType === 'income' ? 'Income' : 'Other'),
      description,
      date: date || new Date(),
      userName: userName || 'Anonymous',
      user: req.user._id
    });
    
    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: 'Error creating expense' });
  }
});

// Update expense
router.put('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Make sure user owns expense
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Error updating expense' });
  }
});

// Delete expense
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Make sure user owns expense
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense' });
  }
});

module.exports = router; 