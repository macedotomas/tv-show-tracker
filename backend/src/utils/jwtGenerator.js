import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


const jwtGenerator = (user) => {
  const payload = {
    user_id: user.user_id
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export default jwtGenerator;