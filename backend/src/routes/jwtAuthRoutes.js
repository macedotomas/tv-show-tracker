import express from 'express';
import { registerUser, loginUser, isVerify } from '../controllers/authController.js';
import validInfo from '../middleware/validInfo.js';
import authorization from '../middleware/authorization.js';

const router = express.Router();

/**
 * @route   POST /register
 * @desc    Register a new user
 * @access  Public
 * 
 * This route receives user data (e.g., name, email, password)
 * and passes it to the registerUser controller to create a new account.
 */
router.post('/register', validInfo, registerUser);

/**
 * @route   POST /login
 * @desc    Authenticate an existing user and return a token
 * @access  Public
 * 
 * This route receives login credentials (email and password)
 * and passes them to the loginUser controller to validate the user
 * and issue a JSON Web Token (JWT) or other session token.
 */
router.post('/login', validInfo, loginUser);

/** * @route   GET /is-verify
 * @desc    Verify if the user is authenticated
 * @access  Private
 * 
 * This route checks if the request includes a valid authentication token.
 * If the token is valid, it confirms that the user is authenticated.
 */
router.get('/is-verify', authorization, isVerify); 





export default router;
