// Функція обчислення середніх значень для кожного типу сенсорних даних
function calculateAverages(sensorData) {
    // sensorData - масив об'єктів { type: 'seismic'|'water'|..., value: числове значення }
    const aggregates = {};
    
    sensorData.forEach(reading => {
      if (!aggregates[reading.type]) {
        aggregates[reading.type] = { total: 0, count: 0 };
      }
      aggregates[reading.type].total += parseFloat(reading.value);
      aggregates[reading.type].count += 1;
    });
    
    const averages = {};
    for (const type in aggregates) {
      averages[type] = aggregates[type].total / aggregates[type].count;
    }
    
    return averages;
  }
  
  // Функція виявлення аномалій порівнянням з пороговими значеннями
  function detectAnomalies(sensorData, thresholds) {
    // thresholds - об'єкт, наприклад: { seismic: 4.0, water: 3.5, temperature: 50 }
    const anomalies = [];
    
    sensorData.forEach(reading => {
      if (thresholds[reading.type] && parseFloat(reading.value) > thresholds[reading.type]) {
        anomalies.push({
          type: reading.type,
          value: reading.value,
          threshold: thresholds[reading.type]
        });
      }
    });
    
    return anomalies;
  }
  
  // Приклад використання:
  const sensorData = [
    { type: 'seismic', value: 4.5 },
    { type: 'seismic', value: 3.8 },
    { type: 'water', value: 3.7 },
    { type: 'water', value: 3.2 },
    { type: 'temperature', value: 45 },
    { type: 'temperature', value: 55 }
  ];
  
  const thresholds = {
    seismic: 4.0,
    water: 3.5,
    temperature: 50
  };
  
  const averages = calculateAverages(sensorData);
  console.log("Середні значення:", averages);
  
  const anomalies = detectAnomalies(sensorData, thresholds);
  console.log("Виявлені аномалії:", anomalies);
  