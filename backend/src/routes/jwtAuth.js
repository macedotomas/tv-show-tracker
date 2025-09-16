import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';



const router = express.Router();



/**
 * @route   POST /register
 * @desc    Register a new user
 * @access  Public
 * 
 * This route receives user data (e.g., name, email, password)
 * and passes it to the registerUser controller to create a new account.
 */
router.post('/register', registerUser);


/**
 * @route   POST /login
 * @desc    Authenticate an existing user and return a token
 * @access  Public
 * 
 * This route receives login credentials (email and password)
 * and passes them to the loginUser controller to validate the user
 * and issue a JSON Web Token (JWT) or other session token.
 */
router.post('/login', loginUser);




export default router;
