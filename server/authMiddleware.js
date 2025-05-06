const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  // Retrieve the Authorization header from the request
  const authHeader = req.headers['authorization'];

  // If there's no Authorization header, respond with 401 Unauthorized
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  // Log the Authorization header for debugging
  console.log('Authorization Header:', authHeader);

  // Extract the token from the Authorization header (Bearer <token>)
  const token = authHeader.split(' ')[1];

  // If there's no token, respond with 401 Unauthorized
  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  // Verify the token using the secret key
  jwt.verify(token, secretKey, (err, decodedToken) => {
    if (err) {
      // If the token is invalid or expired, respond with 403 Forbidden
      console.error('JWT Verification Error:', err);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Log the decoded token for debugging (don't log this in production)
    console.log('Decoded Token:', decodedToken);

    // Set the user ID from the decoded token in the request object
    req.userId = decodedToken.userId;

    // Continue to the next middleware/route handler
    next();
  });
};

module.exports = authenticateToken;


