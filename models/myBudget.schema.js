// models/myBudget.schema.js

const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    related_value: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true
    }
});

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
