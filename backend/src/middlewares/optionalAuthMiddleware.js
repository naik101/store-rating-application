const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'super_secret_store_rating_jwt_key_2026';
      const decoded = jwt.verify(token, secret);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true },
      });
      if (user) {
        req.user = user;
      }
    }
  } catch (err) {
    // If invalid token, proceed without user
  }
  next();
};

module.exports = optionalAuthMiddleware;
