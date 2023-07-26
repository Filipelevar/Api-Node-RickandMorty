const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 105; 

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

app.use(express.json());

app.get('/search', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const nameSearch = req.query.name || '';

  const limit = 20;

  const client = await pool.connect();
  try {

    const totalCharactersQuery = await client.query(
      `SELECT COUNT(*) FROM character WHERE LOWER(name) LIKE '%${nameSearch.toLowerCase()}%';`
    );
    const totalCharacters = parseInt(totalCharactersQuery.rows[0].count);

    const totalPages = Math.ceil(totalCharacters / limit);

    
    const charactersQuery = await client.query(
      `SELECT * FROM character WHERE LOWER(name) LIKE '%${nameSearch.toLowerCase()}%' LIMIT ${limit} OFFSET ${(page - 1) * limit};`
    );
    const characters = charactersQuery.rows;

    res.json({
      characters,
      total_pages: totalPages,
      current_page: page,
      total_items: Math.min(totalCharacters, limit),
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Something went wrong!' });
  } finally {
    client.release();
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});