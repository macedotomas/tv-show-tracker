import { Router } from 'express';
import pool from '../config/db.js';
import authorization from '../middleware/authorization.js';



const router = Router();


router.get('/', authorization, async (req, res) => {
  try {
  
    //res.json(req.user);
    const { user } = req;
    const dashboardData = await pool.query('SELECT username FROM users WHERE user_id = $1', [user.user_id]);


    res.json(dashboardData.rows[0] || { success: false, message: 'User not found' });
  
  
  
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;