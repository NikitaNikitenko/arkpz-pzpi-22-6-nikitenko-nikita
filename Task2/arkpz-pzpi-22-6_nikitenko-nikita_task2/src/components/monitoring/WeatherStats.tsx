import { Activity, Thermometer, Wind } from "lucide-react";
import StatCard from "../stats/StatCard";

interface WeatherStatsProps {
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  loading?: boolean;
  error?: boolean;
}

const WeatherStats = ({ temperature, humidity, windSpeed, loading, error }: WeatherStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        title="Temperature"
        value={temperature ?? 0}
        subtitle="Celsius"
        icon={Thermometer}
        iconColor="text-orange-500"
        badge={temperature ? { text: temperature > 30 ? "High" : "Normal", variant: temperature > 30 ? "high" : "low" } : undefined}
        loading={loading}
        error={error}
      />
      <StatCard
        title="Humidity"
        value={humidity ?? 0}
        subtitle="%"
        icon={Activity}
        iconColor="text-blue-500"
        badge={humidity ? { text: humidity > 70 ? "High" : "Normal", variant: humidity > 70 ? "medium" : "low" } : undefined}
        loading={loading}
        error={error}
      />
      <StatCard
        title="Wind Speed"
        value={windSpeed ?? 0}
        subtitle="km/h"
        icon={Wind}
        iconColor="text-green-500"
        badge={windSpeed ? { text: windSpeed > 50 ? "Strong" : "Normal", variant: windSpeed > 50 ? "high" : "low" } : undefined}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default WeatherStats;