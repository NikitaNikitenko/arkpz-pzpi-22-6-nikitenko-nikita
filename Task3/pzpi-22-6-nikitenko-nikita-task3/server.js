// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware для розбору JSON та роботи з CORS
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Підключення роутерів
const authRouter = require('./auth');
const adminRouter = require('./routes/admin');
const sensorsRouter = require('./routes/sensors');
const disastersRouter = require('./routes/disasters');
const eventsRouter = require('./routes/events'); // новий роут для подій

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/sensors', sensorsRouter);
app.use('/api/disasters', disastersRouter);
app.use('/api/events', eventsRouter);

// Головна сторінка (наприклад, Login.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});


// Підключення роутера для користувачів (оновлення налаштувань)
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);


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