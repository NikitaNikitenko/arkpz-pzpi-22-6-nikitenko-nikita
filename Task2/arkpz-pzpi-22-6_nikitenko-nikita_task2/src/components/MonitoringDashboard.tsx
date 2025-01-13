import { useEffect, useState } from "react";
import { AlertTriangle, Activity, TrendingUp, Wind } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import StatCard from "./stats/StatCard";
import EarthquakeAreaChart from "./charts/EarthquakeAreaChart";
import MagnitudePieChart from "./charts/MagnitudePieChart";
import WeatherStats from "./monitoring/WeatherStats";
import AirQualityStats from "./monitoring/AirQualityStats";
import { useToast } from "@/hooks/use-toast";
import { MonitoredRegion, RiskLevel } from "@/types/monitoring";
import { fetchWeatherData } from "@/services/weatherService";

const WAQI_API_KEY = "d2783c17d5e12d05ef49f99e9c9e4f2f1830bfbf";

const MonitoringDashboard = () => {
  const { toast } = useToast();
  const [selectedRegion, setSelectedRegion] = useState<MonitoredRegion | null>(null);
  const [earthquakeStats, setEarthquakeStats] = useState({
    averageMagnitude: 0,
    maxMagnitude: 0,
    totalEvents: 0,
    riskLevel: "low" as RiskLevel,
  });

  // Fetch regions with real-time updates
  const { data: regions, isLoading: regionsLoading, refetch: refetchRegions } = useQuery({
    queryKey: ["monitored-regions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monitored_regions")
        .select("*");
      if (error) {
        console.error("Error fetching regions:", error);
        toast({
          title: "Error fetching regions",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      console.log("Fetched regions:", data);
      return data as MonitoredRegion[];
    },
  });

  // Listen for real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "monitored_regions",
        },
        (payload) => {
          console.log("Real-time update:", payload);
          // Refetch regions when any change occurs
          refetchRegions();
          
          // Show toast notification
          const eventType = payload.eventType;
          const regionName = (payload.new as MonitoredRegion)?.region_name || 
                           (payload.old as MonitoredRegion)?.region_name;
          
          let toastMessage = "";
          switch (eventType) {
            case "INSERT":
              toastMessage = `New region "${regionName}" added`;
              break;
            case "DELETE":
              toastMessage = `Region "${regionName}" deleted`;
              // If the deleted region was selected, clear selection
              if (selectedRegion?.id === (payload.old as MonitoredRegion)?.id) {
                setSelectedRegion(null);
              }
              break;
            case "UPDATE":
              toastMessage = `Region "${regionName}" updated`;
              break;
          }
          
          toast({
            title: "Region Updated",
            description: toastMessage,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, refetchRegions, selectedRegion]);

  const { data: earthquakeData, isLoading: earthquakeLoading } = useQuery({
    queryKey: ["earthquake-data", selectedRegion],
    queryFn: async () => {
      if (!selectedRegion) return null;
      
      const startTime = new Date();
      startTime.setDate(startTime.getDate() - 7);
      
      console.log("Fetching earthquake data for region:", selectedRegion);
      const response = await fetch(
        `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startTime.toISOString()}&latitude=${selectedRegion.latitude}&longitude=${selectedRegion.longitude}&maxradiuskm=${selectedRegion.radius}`
      );
      
      if (!response.ok) {
        const error = await response.text();
        console.error("USGS API error:", error);
        toast({
          title: "Error fetching earthquake data",
          description: "Failed to fetch data from USGS",
          variant: "destructive",
        });
        throw new Error("Failed to fetch earthquake data");
      }

      const data = await response.json();
      console.log("Fetched earthquake data:", data);

      // Calculate statistics
      if (data.features && data.features.length > 0) {
        const magnitudes = data.features.map((f: any) => f.properties.mag).filter(Boolean);
        const avgMag = magnitudes.length > 0 
          ? magnitudes.reduce((a: number, b: number) => a + b, 0) / magnitudes.length 
          : 0;
        const maxMag = magnitudes.length > 0 ? Math.max(...magnitudes) : 0;
        
        let riskLevel: RiskLevel = "low";
        if (maxMag > 5) {
          riskLevel = "high";
        } else if (maxMag > 3) {
          riskLevel = "medium";
        }
        
        setEarthquakeStats({
          averageMagnitude: Number(avgMag.toFixed(2)),
          maxMagnitude: Number(maxMag.toFixed(2)),
          totalEvents: data.features.length,
          riskLevel,
        });
      } else {
        // Reset stats when no data is available
        setEarthquakeStats({
          averageMagnitude: 0,
          maxMagnitude: 0,
          totalEvents: 0,
          riskLevel: "low",
        });
        console.log("No earthquake data found for the selected region");
      }

      return data;
    },
    enabled: !!selectedRegion,
  });

  // Fetch weather data using the new service
  const { data: weatherData, isLoading: weatherLoading } = useQuery({
    queryKey: ["weather-data", selectedRegion],
    queryFn: async () => {
      if (!selectedRegion) return null;
      try {
        return await fetchWeatherData(selectedRegion.latitude, selectedRegion.longitude);
      } catch (error: any) {
        console.error("Weather API error:", error);
        toast({
          title: "Error fetching weather data",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
    },
    enabled: !!selectedRegion,
  });

  const { data: airQualityData, isLoading: airQualityLoading } = useQuery({
    queryKey: ["air-quality-data", selectedRegion],
    queryFn: async () => {
      if (!selectedRegion) return null;
      
      try {
        const response = await fetch(
          `https://api.waqi.info/feed/geo:${selectedRegion.latitude};${selectedRegion.longitude}/?token=${WAQI_API_KEY}`
        );
        
        if (!response.ok) {
          console.error("Air quality API error - Response not OK:", response.status);
          throw new Error("Air quality API error");
        }
        
        const data = await response.json();
        console.log("Air quality data:", data);
        
        if (data.status === "error") {
          console.error("Air quality API error:", data.data);
          throw new Error(data.data);
        }
        
        // Handle case where air quality data is not available
        if (!data.data || !data.data.iaqi) {
          console.log("No air quality data available for this location");
          return {
            pm25: 0,
            pm10: 0,
            aqi: 0,
          };
        }
        
        return {
          pm25: data.data.iaqi.pm25?.v || 0,
          pm10: data.data.iaqi.pm10?.v || 0,
          aqi: data.data.aqi || 0,
        };
      } catch (error: any) {
        console.error("Air quality API error:", error);
        toast({
          title: "Error fetching air quality data",
          description: "Air quality data temporarily unavailable",
          variant: "destructive",
        });
        // Return default values instead of null to prevent UI errors
        return {
          pm25: 0,
          pm10: 0,
          aqi: 0,
        };
      }
    },
    enabled: !!selectedRegion,
  });

  // Prepare chart data
  const timeSeriesData = earthquakeData?.features?.map((feature: any) => ({
    time: new Date(feature.properties.time).toLocaleTimeString(),
    magnitude: feature.properties.mag || 0,
    depth: feature.geometry.coordinates[2],
    intensity: feature.properties.intensity || Math.random() * 5,
  })) || [];

  // Prepare pie chart data
  const magnitudeDistribution = earthquakeData?.features?.reduce((acc: any, feature: any) => {
    const mag = Math.floor(feature.properties.mag || 0);
    acc[mag] = (acc[mag] || 0) + 1;
    return acc;
  }, {});

  const pieData = magnitudeDistribution
    ? Object.entries(magnitudeDistribution).map(([key, value]) => ({
        name: `Magnitude ${key}`,
        value: value as number,
      }))
    : [];

  const noDataMessage = !selectedRegion 
    ? "Please select a region to view monitoring data" 
    : "No earthquake data available for the selected region in the past 7 days";

  return (
    <div className="space-y-8 animate-fade-in p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Average Magnitude"
          value={earthquakeStats.averageMagnitude}
          subtitle="Richter Scale"
          icon={AlertTriangle}
          iconColor="text-alert-low"
          badge={{ text: `${earthquakeStats.riskLevel} Risk`, variant: earthquakeStats.riskLevel }}
          loading={earthquakeLoading}
        />
        <StatCard
          title="Max Magnitude"
          value={earthquakeStats.maxMagnitude}
          subtitle="Highest Recorded"
          icon={TrendingUp}
          iconColor="text-alert-medium"
          badge={{ text: "Peak", variant: "medium" }}
          loading={earthquakeLoading}
        />
        <StatCard
          title="Total Events"
          value={earthquakeStats.totalEvents}
          subtitle="Past 7 Days"
          icon={Activity}
          iconColor="text-alert-high"
          badge={{ text: "Count", variant: "high" }}
          loading={earthquakeLoading}
        />
        <div className="relative">
          <StatCard
            title="Region"
            value={selectedRegion?.region_name || "Select a region"}
            subtitle="Monitoring Area"
            icon={Wind}
            iconColor="text-blue-500"
            loading={regionsLoading}
          />
          <select
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => {
              const region = regions?.find((r) => r.id === e.target.value);
              setSelectedRegion(region || null);
              if (region) {
                toast({
                  title: "Region Selected",
                  description: `Now monitoring ${region.region_name}`,
                });
              }
            }}
            value={selectedRegion?.id || ""}
            disabled={regionsLoading}
          >
            <option value="">Select a region</option>
            {regions?.map((region) => (
              <option key={region.id} value={region.id}>
                {region.region_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(!selectedRegion || (earthquakeData?.features?.length === 0 && !earthquakeLoading)) ? (
        <div className="text-center p-8 text-muted-foreground bg-muted/50 rounded-lg">
          {noDataMessage}
        </div>
      ) : (
        <>
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
              <WeatherStats
                temperature={weatherData?.temperature || 0}
                humidity={weatherData?.humidity || 0}
                windSpeed={weatherData?.windSpeed || 0}
                loading={weatherLoading}
              />
              <AirQualityStats
                pm25={airQualityData?.pm25 || 0}
                pm10={airQualityData?.pm10 || 0}
                aqi={airQualityData?.aqi || 0}
                loading={airQualityLoading}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <EarthquakeAreaChart data={timeSeriesData} loading={earthquakeLoading} />
              <MagnitudePieChart data={pieData} loading={earthquakeLoading} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MonitoringDashboard;
