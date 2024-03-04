const mongoose = require('mongoose');
const Budget = require('./models/myBudget.schema'); // Change the import statement to import the model, not the schema

// MongoDB connection URL
const mongoURL = 'mongodb://localhost:27017/myBudget';

// Data to be inserted
const budgetData = [
    {
        "title": "Dining out",
        "related_value": 25,
        "color": "#98abc5"
    },
    {
        "title": "Rent",
        "related_value": 800,
        "color": "#8a89a6"
    },
    {
        "title": "Grocery",
        "related_value": 110,
        "color": "#7b6888"
    },
    {
        "title": "Electric",
        "related_value": 80,
        "color": "#6b486b"
    },
    {
        "title": "Car",
        "related_value": 300,
        "color": "#a05d56"
    },
    {
        "title": "Water",
        "related_value": 30,
        "color": "#d0743c"
    },
    {
        "title": "Gas",
        "related_value": 140,
        "color": "#ff8c00"
    }
];

// Connect to MongoDB
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        // Insert data into MongoDB
        return Budget.insertMany(budgetData);
    })
    .then(() => {
        console.log('Data inserted successfully');
        // Close the connection
        return mongoose.disconnect();
    })
    .then(() => {
        console.log('Disconnected from MongoDB');
    })
    .catch((err) => {
        console.error('Error:', err);
    });
