import pool from '../config/db.js';





export const getAllTVShows = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tv_shows');
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching TV shows:', err);
    res.status(500).json({ error: 'Failed to fetch TV shows' });
  }

};

export const createTVShow = async (req, res) => {
  const { title, release_year, genre } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO tv_shows (title, release_year, genre) VALUES ($1, $2, $3) RETURNING *',
      [title, release_year, genre]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating TV show:', err);
    res.status(500).json({ error: 'Failed to create TV show' });
  }
};

