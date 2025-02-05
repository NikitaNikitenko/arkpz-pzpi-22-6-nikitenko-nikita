const express = require('express');
const router = express.Router();
const db = require('./db');

// Отримати всі катастрофи за останній період (за замовчуванням 3 дні)
router.get('/', async (req, res) => {
    try {
        const { days = 3 } = req.query; // Період у днях
        const result = await db.getDisasters(days);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Отримати катастрофи за типом (наприклад, землетруси, повені тощо)
router.get('/type/:type', async (req, res) => {
    try {
        const { type } = req.params; // Тип катастрофи (earthquake, flood, volcano, wildfire)
        const result = await db.getDisastersByType(type);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Отримати катастрофи в певному радіусі від заданих координат
router.get('/nearby', async (req, res) => {
    try {
        const { lat, lng, radius = 100000 } = req.query; // Координати та радіус у метрах
        const result = await db.getDisastersInRadius(lat, lng, radius);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Додати нову катастрофу
router.post('/', async (req, res) => {
    try {
        const { type, magnitude, lat, lng, description, severity, radius_affected, source } = req.body;

        // Валідація обов'язкових полів
        if (!type || !lat || !lng) {
            return res.status(400).json({ error: "Type, latitude, and longitude are required" });
        }

        const result = await db.insertDisaster(
            type,
            magnitude,
            lat,
            lng,
            description,
            severity,
            radius_affected,
            source
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Отримати деталі конкретної катастрофи за ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.pool.query('SELECT * FROM disasters WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Disaster not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Оновити інформацію про катастрофу
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { type, magnitude, description, severity, radius_affected, source } = req.body;

        const result = await db.pool.query(
            `UPDATE disasters 
             SET type = $1, magnitude = $2, description = $3, severity = $4, radius_affected = $5, source = $6 
             WHERE id = $7 
             RETURNING *`,
            [type, magnitude, description, severity, radius_affected, source, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Disaster not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Видалити катастрофу
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.pool.query('DELETE FROM disasters WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Disaster not found" });
        }

        res.json({ message: "Disaster deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Отримати історичні дані для конкретної катастрофи
router.get('/:id/history', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.pool.query(
            'SELECT * FROM historical_data WHERE disaster_id = $1 ORDER BY recorded_at DESC',
            [id]
        );

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Додати історичні дані для катастрофи
router.post('/:id/history', async (req, res) => {
    try {
        const { id } = req.params;
        const { data } = req.body;

        if (!data) {
            return res.status(400).json({ error: "Data is required" });
        }

        const result = await db.insertHistoricalData(id, data);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;