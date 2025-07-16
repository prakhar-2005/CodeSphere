const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const protect = async (req, res, next) => {
  let token;

  if (req.cookies.jwt) {
    try {
      token = req.cookies.jwt;

      // Verify token 
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // .select('-password') to avoid sending the hashed password back
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found for this token.' });
      }

      next(); 
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

//for future use, role-based access control
const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ message: 'Not authorized, no user attached to request. (Missing protect middleware?)' });
        }

        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `User role '${req.user.role}' is not authorized to access this route. Required roles: ${roles.join(', ')}` });
        }
        next();
    };
};

module.exports = { protect, authorize };
