import express from 'express';
import {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus
} from '../controllers/favoritesController.js';
import authorization from '../middleware/authorization.js';

const router = express.Router();

// All routes require authentication
router.use(authorization);

router.get('/', getUserFavorites);
router.post('/:showId', addToFavorites);
router.delete('/:showId', removeFromFavorites);
router.get('/check/:showId', checkFavoriteStatus);

export default router;
