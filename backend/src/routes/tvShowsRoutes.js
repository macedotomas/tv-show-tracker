import express from 'express';
import {getAllTVShows, createTVShow } from '../controllers/tvShowsController.js';

const router = express.Router();

router.get('/', getAllTVShows);
router.post('/', createTVShow);

export default router;
