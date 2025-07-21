const express = require('express');
const dotenv = require('dotenv') 
const cors = require('cors'); 
const connectDB = require('./config/db'); 
const problemRoutes = require('./routes/problemRoutes'); 
const authRoutes = require('./routes/authRoutes'); 
const submissionRoutes = require('./routes/submissionRoutes');
const cookieParser = require('cookie-parser');

dotenv.config(); // Load environment variables from .env
connectDB();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); 
app.use(cors({
    origin: `${process.env.VITE_FRONTEND_BASE_URL}`,
    credentials: true, // Allow cookies to be sent
}));

app.use('/api/problems', problemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/submission', submissionRoutes);

app.get('/', (req, res) => {
    res.send('CodeSphere Backend API is running!');
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));