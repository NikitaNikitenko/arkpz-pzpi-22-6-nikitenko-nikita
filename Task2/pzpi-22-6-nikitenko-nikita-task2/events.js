// routes/events.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Оскільки node-fetch v3 є ESM‑базованим, використаємо функцію‑обгортку для динамічного імпорту
async function myFetch(url, options) {
  const fetchModule = await import('node-fetch');
  return fetchModule.default(url, options);
}

// Допоміжна функція: отримання даних про землетруси з USGS
async function fetchEarthquakeEvents(periodDays) {
  let timeRange = 'week';
  if (periodDays > 7) {
    timeRange = 'month';
  }
  const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_${timeRange}.geojson`;
  const response = await myFetch(url);
  const data = await response.json();
  const periodStart = Date.now() - (periodDays * 24 * 60 * 60 * 1000);
  const events = data.features.map(feature => {
    return {
      type: 'earthquake',
      title: feature.properties.place,
      magnitude: feature.properties.mag,
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
      event_time: new Date(feature.properties.time),
      source: 'USGS'
    };
  }).filter(event => {
    const time = new Date(event.event_time).getTime();
    return time >= periodStart && time <= Date.now();
  });
  return events;
}

// Допоміжна функція: отримання подій з EONET
async function fetchEONETEvents(periodDays) {
  const url = `https://eonet.gsfc.nasa.gov/api/v3/events`;
  const response = await myFetch(url);
  const data = await response.json();
  const periodStart = Date.now() - (periodDays * 24 * 60 * 60 * 1000);
  const events = data.events.map(event => {
    const geometry = event.geometry[event.geometry.length - 1];
    let type = 'other';
    if (event.categories && event.categories.length > 0) {
      const categoryId = event.categories[0].id;
      if (categoryId === 'volcanoes') type = 'volcano';
      else if (categoryId === 'wildfires') type = 'wildfire';
      else if (categoryId === 'severeStorms') type = 'flood';
    }
    return {
      type: type,
      title: event.title,
      magnitude: null,
      lat: geometry.coordinates[1],
      lng: geometry.coordinates[0],
      event_time: new Date(geometry.date),
      source: 'EONET'
    };
  }).filter(event => {
    const time = new Date(event.event_time).getTime();
    return time >= periodStart && time <= Date.now();
  });
  return events;
}

// Функція для очищення старих подій (старше 30 днів)
async function clearOldEvents() {
  await db.query("DELETE FROM events WHERE event_time < NOW() - INTERVAL '30 days'");
}

// POST /fetch – отримуємо події із зовнішніх сервісів та записуємо їх у БД
router.post('/fetch', async (req, res) => {
  try {
    const periodDays = req.body.periodDays || 3;
    const earthquakes = await fetchEarthquakeEvents(periodDays);
    const eonetEvents = await fetchEONETEvents(periodDays);
    const events = [...earthquakes, ...eonetEvents];
    await clearOldEvents();
    for (const event of events) {
      await db.insertEvent(event);
    }
    res.json({ message: "Events fetched and stored", count: events.length });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET / – повертаємо збережені події
router.get('/', async (req, res) => {
  try {
    const periodDays = req.query.periodDays || 3;
    const result = await db.getEvents(periodDays);
    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving events:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
