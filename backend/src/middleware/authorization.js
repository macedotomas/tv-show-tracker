import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// middleware/authorization.js
const authorization = async (req, res, next) => {
  try {
    let jwtToken = req.header('token');
    if (!jwtToken) {
      const auth = req.header('authorization') || '';
      if (auth.toLowerCase().startsWith('bearer ')) {
        jwtToken = auth.slice(7);
      }
    }
    if (!jwtToken) return res.status(403).json({ success:false, message:'Not authorized' });
    const payload = jwt.verify(jwtToken, process.env.JWT_SECRET);
    
    // Attach user information to the request object
    req.user = payload?.user ?? payload;
    next();
  } catch (err) {
    console.error(err.message);
    return res.status(403).json({ success:false, message:'Not authorized' });
  }
};
export default authorization;
