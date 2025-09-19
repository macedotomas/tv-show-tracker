import express from 'express';
import {
  getEpisodesByShow,
  getEpisodesByShowGrouped
} from '../controllers/episodesController.js';

const router = express.Router();

router.get('/show/:showId', getEpisodesByShow);
router.get('/show/:showId/seasons', getEpisodesByShowGrouped);

export default router;
