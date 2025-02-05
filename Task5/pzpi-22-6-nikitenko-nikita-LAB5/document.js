document.addEventListener('DOMContentLoaded', () => {
    const seismicCtx = document.getElementById('seismicChart').getContext('2d');
    const pressureCtx = document.getElementById('pressureChart').getContext('2d');
    const waterCtx = document.getElementById('waterChart').getContext('2d');
    const settingsForm = document.getElementById('settings-form');

    let seismicChart, pressureChart, waterChart;

    function createChart(ctx, label, data, color) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, `${color}33`);
        gradient.addColorStop(1, `${color}00`);

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: color,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: gradient,
                    pointBackgroundColor: color,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            borderDash: [5, 5],
                            color: '#e2e8f0'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    async function fetchSensorData() {
        const response = await fetch('http://localhost:3000/api/sensors');
        const data = await response.json();
        console.log('Sensor Data:', data);
    }

    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const seismicThreshold = parseFloat(document.getElementById('seismic-threshold').value);
        const pressureThreshold = parseFloat(document.getElementById('pressure-threshold').value);
        const waterThreshold = parseFloat(document.getElementById('water-threshold').value);

        const response = await fetch(`http://localhost:3000/api/users/${email}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                seismic_threshold: seismicThreshold,
                pressure_threshold: pressureThreshold,
                water_threshold: waterThreshold
            }),
        });
        const result = await response.json();
        console.log('Updated Settings:', result);
        alert('Settings saved!');
    });

    seismicChart = createChart(seismicCtx, 'Seismic Activity', [0.1, 0.2, 0.15, 0.2, 0.25, 0.2], '#16a34a');
    pressureChart = createChart(pressureCtx, 'Atmospheric Pressure', [760, 762, 763, 765, 764, 765], '#eab308');
    waterChart = createChart(waterCtx, 'Water Level', [4.2, 4.3, 4.5, 4.6, 4.7, 4.8], '#dc2626');

    fetchSensorData();
});