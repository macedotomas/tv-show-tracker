import express from 'express';
import {
  getTVShows, 
  getTVShow, 
  createTVShow, 
  updateTVShow, 
} from '../controllers/tvShowsController.js';

const router = express.Router();

router.get('/', getTVShows);
router.get('/:id', getTVShow);
router.post('/', createTVShow);
router.put('/:id', updateTVShow);
router.delete('/:id', deleteTVShow);

export default router;
