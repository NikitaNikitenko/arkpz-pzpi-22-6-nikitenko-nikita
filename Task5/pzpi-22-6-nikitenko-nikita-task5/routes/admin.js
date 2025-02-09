// routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../auth'); // Захищаємо маршрути для адміністратора

// Отримання списку всіх користувачів (тільки для адміністратора)
router.get('/users', authenticate, async (req, res) => {
  try {
    const users = await db.getUsers();
    res.json(users.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Оновлення ролі користувача
router.put('/user/:id/role', authenticate, async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    await db.updateUserRole(userId, role);
    res.json({ message: "User role updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
