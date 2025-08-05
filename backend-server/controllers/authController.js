const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// get readable error message from Mongoose validation errors
const getMongooseErrorMessage = (err) => {
  let message = 'Server Error';
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(val => val.message).join(', ');
  } else if (err.code === 11000) { // Duplicate key error
    message = `Duplicate field value entered: ${Object.keys(err.keyValue)[0]} already exists.`;
  }
  return message;
};

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    const user = await User.create({
      username,
      email,
      password, 
    });

    if (user) {
      generateToken(res, user._id); 

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        message: 'User registered successfully',
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: getMongooseErrorMessage(error) });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter email and password' });
  }

  try {
    const user = await User.findOne({ email }).select('+password'); // Explicitly select password
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    generateToken(res, user._id); // Generate JWT and send cookie

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      message: 'Logged in successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'An unexpected error occurred during login. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? getMongooseErrorMessage(error) : undefined,
    });
  }
};

const logoutUser = (req, res) => {
  res.cookie('jwt', 'none', { 
    expires: new Date(0), 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false,
    // sameSite: 'strict', 
    sameSite: 'Lax', 
});
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};