// mongodb.js

const { MongoClient } = require('mongodb');

// MongoDB connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myBudget';

// Connect to MongoDB
const connectToMongoDB = async () => {
    try {
        const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected successfully to MongoDB');
        return client.db(dbName);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};

// Function to add a new user
const addUser = async (username, email) => {
    const db = await connectToMongoDB();
    try {
        // Insert the new user document with initial budget value
        await db.collection('users').insertOne({
            username: username,
            email: email,
            budget: {
                value: 0
            }
        });
        console.log('User added successfully');
    } catch (error) {
        console.error('Error adding user:', error);
        throw error;
    } finally {
        db.client.close();
    }
};

module.exports = {
    connectToMongoDB,
    addUser
};
