import pool from '../config/db.js';

// GET /favorites - Get all favorite TV shows for the authenticated user
export const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.user_id; // Assuming user info is added by auth middleware
    
    const query = `
      SELECT 
        ts.show_id,
        ts.title,
        ts.description,
        ts.genre,
        ts.type,
        ts.release_date,
        ts.rating,
        ts.created_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'actor_id', a.actor_id,
              'name', a.name,
              'birth_date', a.birth_date,
              'biography', a.biography
            )
          ) FILTER (WHERE a.actor_id IS NOT NULL),
          '[]'
        ) as actors
      FROM favorites f
      INNER JOIN tv_shows ts ON f.show_id = ts.show_id
      LEFT JOIN show_actors sa ON ts.show_id = sa.show_id
      LEFT JOIN actors a ON sa.actor_id = a.actor_id
      WHERE f.user_id = $1
      GROUP BY ts.show_id
      ORDER BY ts.title ASC
    `;
    
    const { rows } = await pool.query(query, [userId]);
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching user favorites:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch favorites' });
  }
};

// POST /favorites/:showId - Add a TV show to favorites
export const addToFavorites = async (req, res) => {
  const { showId } = req.params;
  const userId = req.user.user_id;
  
  // Basic guard for numeric IDs
  if (isNaN(showId)) {
    return res.status(400).json({ success: false, message: 'Invalid show ID' });
  }

  try {
    // Check if the TV show exists
    const showCheckQuery = 'SELECT show_id FROM tv_shows WHERE show_id = $1';
    const showResult = await pool.query(showCheckQuery, [showId]);
    
    if (showResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'TV show not found' });
    }

    // Try to insert the favorite (will fail if already exists due to PRIMARY KEY constraint)
    const insertQuery = 'INSERT INTO favorites (user_id, show_id) VALUES ($1, $2)';
    await pool.query(insertQuery, [userId, showId]);
    
    res.status(201).json({ success: true, message: 'TV show added to favorites' });
  } catch (err) {
    if (err.code === '23505') { // PostgreSQL duplicate key error
      return res.status(409).json({ success: false, message: 'TV show is already in favorites' });
    }
    console.error('Error adding to favorites:', err);
    res.status(500).json({ success: false, message: 'Failed to add to favorites' });
  }
};

// DELETE /favorites/:showId - Remove a TV show from favorites
export const removeFromFavorites = async (req, res) => {
  const { showId } = req.params;
  const userId = req.user.user_id;
  
  // Basic guard for numeric IDs
  if (isNaN(showId)) {
    return res.status(400).json({ success: false, message: 'Invalid show ID' });
  }

  try {
    const deleteQuery = 'DELETE FROM favorites WHERE user_id = $1 AND show_id = $2';
    const { rowCount } = await pool.query(deleteQuery, [userId, showId]);
    
    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'TV show not found in favorites' });
    }
    
    res.status(200).json({ success: true, message: 'TV show removed from favorites' });
  } catch (err) {
    console.error('Error removing from favorites:', err);
    res.status(500).json({ success: false, message: 'Failed to remove from favorites' });
  }
};

// GET /favorites/check/:showId - Check if a TV show is in user's favorites
export const checkFavoriteStatus = async (req, res) => {
  const { showId } = req.params;
  const userId = req.user.user_id;
  
  // Basic guard for numeric IDs
  if (isNaN(showId)) {
    return res.status(400).json({ success: false, message: 'Invalid show ID' });
  }

  try {
    const query = 'SELECT 1 FROM favorites WHERE user_id = $1 AND show_id = $2';
    const { rows } = await pool.query(query, [userId, showId]);
    
    const isFavorite = rows.length > 0;
    res.status(200).json({ success: true, data: { isFavorite } });
  } catch (err) {
    console.error('Error checking favorite status:', err);
    res.status(500).json({ success: false, message: 'Failed to check favorite status' });
  }
};
