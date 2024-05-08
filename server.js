const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); // Add JWT import

const Budget = require('./models/myBudget.schema');
const tokenRouter = require('./tokenManagement'); // Import the router

const app = express();
const port = 3000;

app.use(cookieParser());
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(compression());

// Connect to MongoDB
//mongoose.connect('mongodb+srv://doadmin:07JndKlv94851ab3@mybudget-ad997177.mongo.ondigitalocean.com/myBudget',{
  mongoose.connect('mongodb+srv://doadmin:07JndKlv94851ab3@mybudget-ad997177.mongo.ondigitalocean.com/admin?tls=true&authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

// Schema for user
const UserSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = mongoose.model('User', UserSchema);

const secretKey = crypto.randomBytes(32).toString('hex');
console.log('Secret Key:', secretKey);

// Function to generate JWT token
function generateAuthToken(user) {
  return jwt.sign({ userId: user.id, userEmail: user.email }, secretKey, { expiresIn: '1h' }); // Token expires in 1 hour
}

app.use(tokenRouter);

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateAuthToken(user);

    res.cookie('authToken', token, { httpOnly: true, sameSite: 'None', secure: true }); // Secure cookie

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Signup endpoint
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    // Generate JWT token
    const token = generateAuthToken(newUser);

    // Set JWT token in cookie
    res.cookie('authToken', token, { httpOnly: true, sameSite: 'None', secure: true }); // Secure cookie

    // Send response
    res.status(201).json({ message: 'Signup successful', token });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = decoded;
    next();
  });
}

// Logout route
app.post('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.status(200).json({ message: 'User signed out successfully' });
});

// Fetch data from MongoDB (requires valid JWT token)
app.get('/budget', verifyToken, async (req, res) => {
  try {
    const data = await Budget.find();
    res.json(data);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new data to MongoDB (requires valid JWT token)
app.post('/budget', verifyToken, async (req, res) => {
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

// Update existing data in MongoDB by title (requires valid JWT token)
app.put('/budget/:title', verifyToken, async (req, res) => {
  try {
    const { title } = req.params;
    const { related_value, color } = req.body;
    
    const updatedData = await Budget.findOneAndUpdate({ title }, { related_value, color }, { new: true });
    
    if (!updatedData) {
      return res.status(404).json({ error: 'Data not found' });
    }

    res.json(updatedData);
  } catch (err) {
    console.error('Error updating data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete existing data from MongoDB (requires valid JWT token)
app.delete('/budget/:title', verifyToken, async (req, res) => {
  try {
    const { title } = req.params;
    const deletedData = await Budget.findOneAndDelete({ title });
    if (!deletedData) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully', deletedData });
  } catch (err) {
    console.error('Error deleting data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new route to create a new database (requires valid JWT token)
app.post('/new-budget', verifyToken, async (req, res) => {
  try {
    // Drop the existing database
    await mongoose.connection.dropDatabase();

    // Optionally, you can create any initial data here

    res.status(200).json({ message: 'New budget created successfully' });
  } catch (err) {
    console.error('Error creating new budget:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = app;
