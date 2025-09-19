import pool from '../config/db.js';





// CRUD Operations

export const getTVShows = async (req, res) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; // Default 12 items per page
    const offset = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100.' 
      });
    }

    // Get total count for pagination metadata
    const countQuery = 'SELECT COUNT(*) FROM tv_shows';
    const countResult = await pool.query(countQuery);
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const query = `
      SELECT 
        ts.*,
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
      FROM tv_shows ts
      LEFT JOIN show_actors sa ON ts.show_id = sa.show_id
      LEFT JOIN actors a ON sa.actor_id = a.actor_id
      GROUP BY ts.show_id
      ORDER BY ts.title
      LIMIT $1 OFFSET $2
    `;
    
    const { rows } = await pool.query(query, [limit, offset]);
    console.log(`Fetched ${rows.length} TV shows with actors (page ${page}/${totalPages}):`, rows);
    
    res.status(200).json({
      success: true, 
      data: rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching TV shows:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch TV shows' });
  }
};

export const createTVShow = async (req, res) => {
  const { title, description, genre, type, release_date, rating } = req.body;

  if (!title || !release_date || !genre || !type) {
    return res.status(400).json({ success: false, message: 'Title, release date, genre, and type are required' });
  }
  
  try {
    const { rows } = await pool.query(
      'INSERT INTO tv_shows (title, description, genre, type, release_date, rating) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description || null, genre, type, release_date, rating || null]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error creating TV show:', err);
    res.status(500).json({ success: false, message: 'Failed to create TV show' });
  }
};

export const getTVShow = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        ts.*,
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
      FROM tv_shows ts
      LEFT JOIN show_actors sa ON ts.show_id = sa.show_id
      LEFT JOIN actors a ON sa.actor_id = a.actor_id
      WHERE ts.show_id = $1
      GROUP BY ts.show_id
    `;
    
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'TV show not found' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error fetching TV show:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch TV show' });
  }
};

// PATCH /tv-shows/:id
export const updateTVShow = async (req, res) => {
  const { id } = req.params;

  // Only allow these columns to be updated
  const UPDATABLE = {
    title: 'title',
    description: 'description',
    genre: 'genre',
    type: 'type',
    release_date: 'release_date',
    rating: 'rating',
  };

  // Basic guard for numeric IDs (if show_id is integer)
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid show ID' });
  }

  // Build SET clause only from keys that are present in the body (even if null)
  const sets = [];
  const values = [];
  let i = 1;

  for (const [bodyKey, colName] of Object.entries(UPDATABLE)) {
    // Use hasOwnProperty so we can intentionally set NULL (vs. skipping undefined)
    if (Object.prototype.hasOwnProperty.call(req.body, bodyKey)) {
      // Add casts for typed columns
      let cast = '';
      if (colName === 'type') cast = '::show_type';
      if (colName === 'release_date') cast = '::date';
      if (colName === 'rating') cast = '::numeric';

      sets.push(`${colName} = $${i}${cast}`);
      values.push(req.body[bodyKey]); // may be string, null, etc.
      i++;
    }
  }

  if (sets.length === 0) {
    return res.status(400).json({ success: false, message: 'No valid fields to update' });
  }

  // Optional: lightweight client-side validation for date if provided
  if (Object.prototype.hasOwnProperty.call(req.body, 'release_date') &&
      req.body.release_date !== null &&
      isNaN(Date.parse(req.body.release_date))) {
    return res.status(400).json({ success: false, message: 'Invalid release_date format' });
  }

  try {
    values.push(id); // WHERE parameter
    const query = `
      UPDATE tv_shows
      SET ${sets.join(', ')}
      WHERE show_id = $${i}
      RETURNING *;
    `;

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'TV show not found' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    // Common helpful error surfaces:
    // - invalid enum value for type (show_type)
    // - rating out of range (CHECK constraint)
    // - invalid date cast
    console.error(`Error updating TV show ${id}:`, err);
    return res.status(500).json({ success: false, message: 'Failed to update TV show' });
  }
};


export const deleteTVShow = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM tv_shows WHERE show_id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'TV show not found' });
    }
    res.status(200).json({ success: true, message: 'TV show deleted successfully' });
  } catch (err) {
    console.error('Error deleting TV show:', err);
    res.status(500).json({ success: false, message: 'Failed to delete TV show' });
  }
};
