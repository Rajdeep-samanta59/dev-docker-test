const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Connect to PostgreSQL using environment variables
const db = new Pool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// GET all tasks
app.get('/api/tasks', async (req, res) => {
  const result = await db.query('SELECT * FROM tasks ORDER BY id DESC');
  res.json(result.rows);
});

// POST create a task
app.post('/api/tasks', async (req, res) => {
  const { title } = req.body;
  const result = await db.query(
    'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
    [title]
  );
  res.json(result.rows[0]);
});

// PUT toggle complete/incomplete
app.put('/api/tasks/:id', async (req, res) => {
  const result = await db.query(
    'UPDATE tasks SET completed = NOT completed WHERE id = $1 RETURNING *',
    [req.params.id]
  );
  res.json(result.rows[0]);
});

// DELETE a task
app.delete('/api/tasks/:id', async (req, res) => {
  await db.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

app.listen(3000, () => console.log('Backend running on port 3000'));
