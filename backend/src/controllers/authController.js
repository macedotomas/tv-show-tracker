import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwtGenerator from '../utils/jwtGenerator.js'; 
import authorization from '../middleware/authorization.js';


export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if user email already exists
    const userEmailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userEmailCheck.rows.length > 0) {
      return res.status(401).json({ success: false, message: 'Email already in use' });
    }
    // Check if user username already exists
    const userUsernameCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userUsernameCheck.rows.length > 0) {
      return res.status(401).json({ success: false, message: 'Username already in use' });
    } else {
      // Hash the password before saving
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new user into the database
      const newUser = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING user_id, username, email',
        [username, email, hashedPassword]
      );

      const token = jwtGenerator(newUser.rows[0]);

      // Return the new user data and token
      //res.json({token});
      
      return res.status(201).json({ success: true, data: newUser.rows[0] });
    }

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Login Controller
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = userCheck.rows[0];

    // Compare provided password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwtGenerator(user);

    // If login is successful, return user data (excluding password hash)
    //const { password: _omit, ...userData } = user;
    const { password_hash, ...userData } = user;
    return res.status(200).json({ success: true, data: userData, token });


  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// Verify Controller
export const isVerify = async (req, res) => {
  try {
    return res.status(200).json({ success: true, message: 'Token is valid' });
  
  
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};