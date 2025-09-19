import pool from '../config/db.js';

// GET /actors/:id/tv-shows - Get all TV shows for a specific actor
export const getActorTvShows = async (req, res) => {
  const { id } = req.params;
  
  // Basic guard for numeric IDs
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid actor ID' });
  }

  try {
    const query = `
      SELECT 
        ts.show_id,
        ts.title,
        ts.description,
        ts.genre,
        ts.type,
        ts.release_date,
        ts.rating
      FROM tv_shows ts
      INNER JOIN show_actors sa ON ts.show_id = sa.show_id
      WHERE sa.actor_id = $1
      ORDER BY ts.release_date DESC, ts.title ASC
    `;
    
    const { rows } = await pool.query(query, [id]);
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching actor TV shows:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch actor TV shows' });
  }
};

// GET /actors/:id - Get actor details with their TV shows
export const getActorWithTvShows = async (req, res) => {
  const { id } = req.params;
  
  // Basic guard for numeric IDs
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid actor ID' });
  }

  try {
    const actorQuery = `
      SELECT 
        actor_id,
        name,
        birth_date,
        biography
      FROM actors
      WHERE actor_id = $1
    `;
    
    const tvShowsQuery = `
      SELECT 
        ts.show_id,
        ts.title,
        ts.description,
        ts.genre,
        ts.type,
        ts.release_date,
        ts.rating
      FROM tv_shows ts
      INNER JOIN show_actors sa ON ts.show_id = sa.show_id
      WHERE sa.actor_id = $1
      ORDER BY ts.release_date DESC, ts.title ASC
    `;

    const [actorResult, tvShowsResult] = await Promise.all([
      pool.query(actorQuery, [id]),
      pool.query(tvShowsQuery, [id])
    ]);

    if (actorResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Actor not found' });
    }

    const actor = actorResult.rows[0];
    actor.tv_shows = tvShowsResult.rows;

    res.status(200).json({ success: true, data: actor });
  } catch (err) {
    console.error('Error fetching actor with TV shows:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch actor details' });
  }
};

// GET /actors - Get all actors with show count
export const getAllActors = async (req, res) => {
  try {
    const query = `
      SELECT 
        a.actor_id,
        a.name,
        a.birth_date,
        a.biography,
        COUNT(sa.show_id) as show_count
      FROM actors a
      LEFT JOIN show_actors sa ON a.actor_id = sa.actor_id
      GROUP BY a.actor_id, a.name, a.birth_date, a.biography
      ORDER BY show_count DESC, a.name ASC
    `;
    
    const { rows } = await pool.query(query);
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching actors:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch actors' });
  }
};
