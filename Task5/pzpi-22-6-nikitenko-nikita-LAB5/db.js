// db.js
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Користувачі
const getUsers = () => pool.query('SELECT * FROM users');
const getUserByEmail = email => pool.query('SELECT * FROM users WHERE email = $1', [email]);

// Катастрофи
const insertDisaster = async (type, magnitude, lat, lng) => {
  return pool.query(
    `INSERT INTO disasters (type, magnitude, location, timestamp)
     VALUES ($1, $2, ST_SetSRID(ST_MakePoint($4, $3), 4326), NOW())
     RETURNING *`,
    [type, magnitude, lat, lng]
  );
};

const getDisasters = (periodDays = 3) => {
  return pool.query(
    `SELECT *, ST_X(location::geometry) AS lng, ST_Y(location::geometry) AS lat 
     FROM disasters 
     WHERE timestamp > NOW() - INTERVAL '${periodDays} days'`
  );
};

// Налаштування користувача
const updateUserSettings = (userId, settings) => {
  return pool.query(
    `INSERT INTO user_settings (user_id, seismic_threshold, water_threshold)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE SET
       seismic_threshold = EXCLUDED.seismic_threshold,
       water_threshold = EXCLUDED.water_threshold`,
    [userId, settings.seismic, settings.water]
  );
};

// Сенсори
const getSensors = () =>
  pool.query(
    'SELECT *, ST_X(location::geometry) AS lng, ST_Y(location::geometry) AS lat FROM sensors'
  );
const updateSensorReading = (sensorId, reading) =>
  pool.query(
    'UPDATE sensors SET last_reading = $1, last_updated = NOW() WHERE id = $2 RETURNING *',
    [reading, sensorId]
  );

// Історичні дані
const insertHistoricalData = (disasterId, data) =>
  pool.query(
    'INSERT INTO historical_data (disaster_id, recorded_data) VALUES ($1, $2) RETURNING *',
    [disasterId, data]
  );

// Розширені запити для катастроф
const getDisastersByType = (type) =>
  pool.query(
    'SELECT * FROM disasters WHERE type = $1 ORDER BY timestamp DESC',
    [type]
  );

const getDisastersInRadius = (lat, lng, radius) =>
  pool.query(
    `SELECT *, ST_X(location::geometry) AS lng, ST_Y(location::geometry) AS lat 
     FROM disasters 
     WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326), $3)`,
    [lng, lat, radius]
  );

module.exports = {
  pool,
  query: pool.query.bind(pool),
  getUsers,
  getUserByEmail,
  insertDisaster,
  getDisasters,
  updateUserSettings,
  getSensors,
  updateSensorReading,
  insertHistoricalData,
  getDisastersByType,
  getDisastersInRadius
};
