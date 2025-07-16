const User = require("../models/User");

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
    res.status(500).json({ message: 'Server Error' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter email and password' });
  }

  try {
    const user = await User.findOne({ email }).select('+password'); // Explicitly select password

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id); // Generate JWT and send cookie

      res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        message: 'Logged in successfully',
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' }); 
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const logoutUser = (req, res) => {
  res.cookie('jwt', '', { // Clear JWT cookie
    httpOnly: true,
    expires: new Date(0), 
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
