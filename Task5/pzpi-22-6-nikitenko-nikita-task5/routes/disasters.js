// routes/disasters.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Створення нової катастрофи
router.post('/', async (req, res) => {
  try {
    const { type, magnitude, lat, lng } = req.body;
    const disaster = await db.insertDisaster(type, magnitude, lat, lng);
    res.status(201).json(disaster.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Отримання катастроф за останні N днів (за замовчуванням 3 дні)
router.get('/', async (req, res) => {
  try {
    const periodDays = req.query.periodDays || 3;
    const disasters = await db.getDisasters(periodDays);
    res.json(disasters.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Отримання катастроф за типом
router.get('/type/:type', async (req, res) => {
  try {
    const type = req.params.type;
    const disasters = await db.getDisastersByType(type);
    res.json(disasters.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Отримання катастроф у радіусі (lat, lng, radius задаються як query параметри)
router.get('/radius', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    const disasters = await db.getDisastersInRadius(lat, lng, radius);
    res.json(disasters.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
