const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  // payload 
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_COOKIE_EXPIRE, 
  });

  const cookieOptions = {
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production' ? true : false,
    sameSite: 'Lax', // for development
    // sameSite: 'strict', 
    maxAge: eval(process.env.JWT_COOKIE_EXPIRE.slice(0, -1)) * 24 * 60 * 60 * 1000, 
    //could use a proper parser for time units
  };

  res.cookie('jwt', token, cookieOptions);
};

module.exports = generateToken;
