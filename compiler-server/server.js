const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compilerRoutes = require('./routes/compilerRoutes');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.VITE_FRONTEND_BASE_URL,
  credentials: true
}));

// Health check
app.get('/', (req, res) => {
  res.send('CodeSphere Compiler Server is running!');
});

app.use('/api', compilerRoutes);

const PORT = process.env.COMPILER_PORT || 8000;
app.listen(PORT, () => {
  console.log(`Compiler server is running on port ${PORT}`);
});