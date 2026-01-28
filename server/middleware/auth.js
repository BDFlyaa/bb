import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables!');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, username, role }
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(403).json({ message: 'Invalid token.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'system_admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};
