const express = require('express');
const router = express.Router();
const db = require('./db');

// Отримати всі сенсори
router.get('/', async (req, res) => {
    try {
        const result = await db.getSensors();
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Оновити показання сенсора
router.put('/:id/reading', async (req, res) => {
    try {
        const { id } = req.params;
        const { reading } = req.body;

        if (!reading) {
            return res.status(400).json({ error: "Reading is required" });
        }

        const result = await db.updateSensorReading(id, reading);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Отримати дані конкретного сенсора
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.pool.query('SELECT * FROM sensors WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Sensor not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Додати новий сенсор
router.post('/', async (req, res) => {
    try {
        const { type, lat, lng, status = 'active' } = req.body;

        if (!type || !lat || !lng) {
            return res.status(400).json({ error: "Type, latitude, and longitude are required" });
        }

        const result = await db.pool.query(
            `INSERT INTO sensors (type, location, status) 
             VALUES ($1, ST_SetSRID(ST_MakePoint($3, $2), 4326), $4) 
             RETURNING *`,
            [type, lat, lng, status]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Видалити сенсор
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.pool.query('DELETE FROM sensors WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Sensor not found" });
        }

        res.json({ message: "Sensor deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;