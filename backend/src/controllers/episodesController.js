import pool from '../config/db.js';

// GET /episodes/:showId - Get all episodes for a specific TV show
export const getEpisodesByShow = async (req, res) => {
  const { showId } = req.params;
  
  // Basic guard for numeric IDs
  if (isNaN(showId)) {
    return res.status(400).json({ success: false, message: 'Invalid show ID' });
  }

  try {
    const query = `
      SELECT 
        episode_id,
        title,
        episode_number,
        season_number,
        release_date,
        created_at
      FROM episodes
      WHERE show_id = $1
      ORDER BY season_number ASC, episode_number ASC
    `;
    
    const { rows } = await pool.query(query, [showId]);
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching episodes:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch episodes' });
  }
};

// GET /episodes/:showId/seasons - Get episodes grouped by season for a specific TV show
export const getEpisodesByShowGrouped = async (req, res) => {
  const { showId } = req.params;
  
  // Basic guard for numeric IDs
  if (isNaN(showId)) {
    return res.status(400).json({ success: false, message: 'Invalid show ID' });
  }

  try {
    const query = `
      SELECT 
        episode_id,
        title,
        episode_number,
        season_number,
        release_date,
        created_at
      FROM episodes
      WHERE show_id = $1
      ORDER BY season_number ASC, episode_number ASC
    `;
    
    const { rows } = await pool.query(query, [showId]);
    
    // Group episodes by season
    const seasonMap = {};
    rows.forEach(episode => {
      const season = episode.season_number;
      if (!seasonMap[season]) {
        seasonMap[season] = [];
      }
      seasonMap[season].push(episode);
    });

    // Convert to array format for easier frontend handling
    const seasons = Object.keys(seasonMap)
      .map(season => ({
        season_number: parseInt(season),
        episodes: seasonMap[season]
      }))
      .sort((a, b) => a.season_number - b.season_number);

    res.status(200).json({ success: true, data: seasons });
  } catch (err) {
    console.error('Error fetching grouped episodes:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch episodes' });
  }
};
