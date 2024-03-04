// server.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const Budget = require('./models/myBudget.schema');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myBudget', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server after successfully connecting to MongoDB
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

// Serve index.html for the root URL                 
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Fetch data from MongoDB and send it as JSON
app.get('/budget', async (req, res) => {
  try {
    const data = await Budget.find();
    res.json(data);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new data to MongoDB
app.post('/budget', async (req, res) => {
  try {
    const { title, related_value, color } = req.body;
    const newData = new Budget({ title, related_value, color });
    await newData.save();
    res.status(201).json(newData);
  } catch (err) {
    console.error('Error adding data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update existing data in MongoDB
app.put('/budget/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, related_value, color } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }
    const updatedData = await Budget.findByIdAndUpdate(id, { title, related_value, color }, { new: true });
    if (!updatedData) {
      return res.status(404).json({ error: 'Data not found' });
    }
    res.json(updatedData);
  } catch (err) {
    console.error('Error updating data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
