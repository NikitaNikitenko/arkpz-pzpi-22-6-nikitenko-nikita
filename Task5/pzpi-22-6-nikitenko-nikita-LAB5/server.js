// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Підключення роутерів
const authRouter = require('./auth');

app.use('/api/auth', authRouter);
// app.use('/api/sensors', sensorsRouter);

// Головна сторінка (Login.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});

// Обробка запитів до неіснуючих сторінок (404)
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Обробник помилок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
