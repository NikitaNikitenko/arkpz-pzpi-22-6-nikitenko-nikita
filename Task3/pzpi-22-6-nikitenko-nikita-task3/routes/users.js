// routes/users.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Оновлення налаштувань користувача за email
router.put('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { seismic_threshold, pressure_threshold, water_threshold } = req.body;
    
    // Знаходимо користувача за email, щоб отримати його ID
    const userResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = userResult.rows[0].id;

    // Оновлюємо налаштування користувача
    // (Переконайтеся, що у вашій базі даних таблиця user_settings має колонки:
    // user_id, seismic_threshold, pressure_threshold, water_threshold)
    const updatedSettings = await db.query(
      `INSERT INTO user_settings (user_id, seismic_threshold, pressure_threshold, water_threshold)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET
         seismic_threshold = EXCLUDED.seismic_threshold,
         pressure_threshold = EXCLUDED.pressure_threshold,
         water_threshold = EXCLUDED.water_threshold
       RETURNING *`,
      [userId, seismic_threshold, pressure_threshold, water_threshold]
    );
    res.json(updatedSettings.rows[0]);
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
