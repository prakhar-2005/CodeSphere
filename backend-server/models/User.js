const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true, 
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [50, "Last name cannot exceed 50 characters"]
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    trim: true,
    lowercase: true, 
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false 
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // enum instead of bool for more flexibility
    default: 'user' // password is not returned in queries by default
  },
}, {
  timestamps: true 
});

// prevents unnecessary re-hashing of password , like when user updates their username
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10); 
  this.password = await bcrypt.hash(this.password, salt); 
  next(); 
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);