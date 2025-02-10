// routes/sensors.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Отримання всіх сенсорів
router.get('/', async (req, res) => {
  try {
    const sensors = await db.getSensors();
    res.json(sensors.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Оновлення показника сенсора (індивідуально)
router.put('/:sensorId', async (req, res) => {
  try {
    const sensorId = req.params.sensorId;
    const { reading } = req.body;
    const updatedSensor = await db.updateSensorReading(sensorId, reading);
    res.json(updatedSensor.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Новий API: Оновлення показників для всіх сенсорів
router.post('/update-readings', async (req, res) => {
  try {
    const sensorTypes = ['seismic', 'water', 'volcano', 'wildfire'];
    let updatedSensors = [];
    for (const type of sensorTypes) {
      const result = await db.query('SELECT * FROM sensors WHERE type = $1', [type]);
      let sensor;
      if (result.rows.length > 0) {
        sensor = result.rows[0];
      } else {
        const insertRes = await db.query(
          'INSERT INTO sensors (name, type, location, last_reading) VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5) RETURNING *',
          [type.toUpperCase() + " Sensor", type, 0, 0, 0.0]
        );
        sensor = insertRes.rows[0];
      }
      let newReading = 0;
      switch(type) {
        case 'seismic':
          newReading = (Math.random() * 10).toFixed(1);
          break;
        case 'water':
          newReading = (Math.random() * 10).toFixed(1);
          break;
        case 'volcano':
          newReading = Math.floor(Math.random() * 6);
          break;
        case 'wildfire':
          newReading = Math.floor(Math.random() * 21);
          break;
      }
      const updateRes = await db.query(
        'UPDATE sensors SET last_reading = $1, last_updated = NOW() WHERE id = $2 RETURNING *',
        [newReading, sensor.id]
      );
      updatedSensors.push(updateRes.rows[0]);
    }
    res.json({ message: "Sensor readings updated", sensors: updatedSensors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
