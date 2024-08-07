const express = require('express');
const pg = require('pg');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  ssl: {
    rejectUnauthorized:true
  }
});

app.get('/api/versions', async (req, res) => {
  const partNumber = req.query.partNumber;
  try {
    const result = await pool.query('SELECT * FROM versions WHERE $1 = ANY(part_numbers)', [partNumber]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error while speaking to database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Tuurrrnn UP`);
});