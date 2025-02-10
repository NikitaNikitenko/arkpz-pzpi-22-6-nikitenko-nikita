// config.js - конфігурація IoT клієнта
const config = {
    samplingInterval: 5000, // Інтервал зчитування даних у мілісекундах
    serverEndpoint: 'http://localhost:3000/api/sensors', // URL серверної частини для передачі даних
    thresholds: {
      seismic: 4.0,
      water: 3.5,
      temperature: 50,
      humidity: 80
    },
    sensorTypes: ['seismic', 'water', 'temperature', 'humidity']
  };
  
  module.exports = config;
  