const express = require('express');
const dotenv = require('dotenv') 
const cors = require('cors'); 
const connectDB = require('./config/db'); 
const problemRoutes = require('./routes/problemRoutes'); 
const authRoutes = require('./routes/authRoutes')
const cookieParser = require('cookie-parser');

dotenv.config(); // Load environment variables from .env
connectDB();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Middleware to parse cookies
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
}));

app.use('/api/problems', problemRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('CodeSphere Backend API is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));