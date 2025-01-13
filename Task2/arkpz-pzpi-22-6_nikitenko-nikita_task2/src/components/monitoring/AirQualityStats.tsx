import { Cloud, Gauge, Wind } from "lucide-react";
import StatCard from "../stats/StatCard";

interface AirQualityStatsProps {
  pm25: number | null;
  pm10: number | null;
  aqi: number | null;
  loading?: boolean;
  error?: boolean;
}

const AirQualityStats = ({ pm25, pm10, aqi, loading, error }: AirQualityStatsProps) => {
  const getAqiLevel = (aqi: number | null) => {
    if (!aqi) return "low";
    if (aqi > 150) return "high";
    if (aqi > 100) return "medium";
    return "low";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        title="PM2.5"
        value={pm25 ?? 0}
        subtitle="µg/m³"
        icon={Cloud}
        iconColor="text-purple-500"
        badge={pm25 ? { text: pm25 > 35 ? "High" : "Normal", variant: pm25 > 35 ? "high" : "low" } : undefined}
        loading={loading}
        error={error}
      />
      <StatCard
        title="PM10"
        value={pm10 ?? 0}
        subtitle="µg/m³"
        icon={Wind}
        iconColor="text-indigo-500"
        badge={pm10 ? { text: pm10 > 150 ? "High" : "Normal", variant: pm10 > 150 ? "high" : "low" } : undefined}
        loading={loading}
        error={error}
      />
      <StatCard
        title="AQI"
        value={aqi ?? 0}
        subtitle="Index"
        icon={Gauge}
        iconColor="text-yellow-500"
        badge={{ text: `${getAqiLevel(aqi)} Risk`, variant: getAqiLevel(aqi) }}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default AirQualityStats;