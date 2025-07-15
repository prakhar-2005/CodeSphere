const express = require('express');
const dotenv = require('dotenv').config(); // Load environment variables from .env
const cors = require('cors'); 
const connectDB = require('./config/db'); 
const problemRoutes = require('./routes/problemRoutes'); 

connectDB();

const app = express();

// Middleware to parse JSON bodies (for POST requests)
app.use(express.json());
// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: false }));
// Enable CORS for all origins (for development, restrict in production)
app.use(cors());

app.use('/api/problems', problemRoutes);

app.get('/', (req, res) => {
    res.send('CodeSphere Backend API is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
