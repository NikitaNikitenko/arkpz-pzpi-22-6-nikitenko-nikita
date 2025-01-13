export interface MonitoredRegion {
  id: string;
  region_name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export interface DisasterStats {
  value: number;
  change: number;
  unit: string;
}

export type RiskLevel = "low" | "medium" | "high";

export interface MonitoringData {
  earthquakes: {
    averageMagnitude: number;
    maxMagnitude: number;
    totalEvents: number;
    riskLevel: RiskLevel;
  };
  weather: {
    temperature: DisasterStats;
    humidity: DisasterStats;
    windSpeed: DisasterStats;
  };
  airQuality: {
    pm25: DisasterStats;
    pm10: DisasterStats;
    aqi: DisasterStats;
  };
}