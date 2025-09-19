import express from 'express';
import {
  getAllActors,
  getActorWithTvShows,
  getActorTvShows
} from '../controllers/actorsController.js';

const router = express.Router();

router.get('/', getAllActors);
router.get('/:id', getActorWithTvShows);
router.get('/:id/tv-shows', getActorTvShows);

export default router;
