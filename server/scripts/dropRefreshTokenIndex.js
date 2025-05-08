// Script to drop the unique index on refreshToken field
const mongoose = require('mongoose');
require('dotenv').config();

async function dropRefreshTokenIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Drop the index
    await mongoose.connection.db.collection('users').dropIndex('refreshToken_1');
    console.log('Successfully dropped refreshToken_1 index');
  } catch (error) {
    if (error.code === 26) {
      console.log('Index does not exist or was already dropped');
    } else {
      console.error('Error dropping index:', error);
    }
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
dropRefreshTokenIndex()
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err));