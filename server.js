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
    rejectUnauthorized: true
  }
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; 

app.get('/api/versions', async (req, res) => {
  const partNumber = req.query.partNumber;
  try {
    const result = await pool.query('SELECT * FROM versions WHERE $1 = ANY(part_numbers)', [partNumber]);
    res.json(result.rows);
  } catch (error) {
    console.error('Fehler bei der Datenbankabfrage:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

app.post('/api/versions', async (req, res) => {
  const { versionNumber, partNumbers, downloadLink, password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Password invalid' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO versions (version_number, download_link, part_numbers) VALUES ($1, $2, $3)',
      [versionNumber, downloadLink, partNumbers.split(',')]
    );
    res.json({ message: 'Added successful' });
  } catch (error) {
    console.error('Error while speaking to database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

process.on('exit', () => {
  pool.end();
});

app.listen(port, () => {
  console.log(`Tuuuurnn UP`);
});
