// auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('./db');

// Маршрут реєстрації користувача
router.post('/register', async (req, res) => {
  console.log("Register endpoint hit with data:", req.body);
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Перевірка, чи співпадають паролі
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Перевірка, чи існує користувач з таким username або email
    const userExists = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (userExists.rows.length > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Хешування пароля
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Вставка нового користувача в БД
    await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
      [username, email, passwordHash]
    );

    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Маршрут логіну користувача
router.post('/login', async (req, res) => {
  console.log("Login endpoint hit with data:", req.body);
  try {
    const { username, password } = req.body;

    // Пошук користувача за username
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Перевірка коректності пароля
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ message: "Login successful" });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
