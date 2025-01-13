import { useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import RegionListItem from "./region/RegionListItem";
import RegionForm from "./region/RegionForm";
import SavedRegionsList from "./region/SavedRegionsList";

// Expanded list of global regions
const commonRegions = [
  { name: "San Francisco Bay Area", lat: 37.7749, lng: -122.4194 },
  { name: "Los Angeles Basin", lat: 34.0522, lng: -118.2437 },
  { name: "New York Metropolitan", lat: 40.7128, lng: -74.0060 },
  { name: "Chicago Metropolitan", lat: 41.8781, lng: -87.6298 },
  { name: "Toronto Metropolitan", lat: 43.6532, lng: -79.3832 },
  { name: "Mexico City Metropolitan", lat: 19.4326, lng: -99.1332 },
  
  // Europe
  { name: "London Metropolitan", lat: 51.5074, lng: -0.1278 },
  { name: "Paris Metropolitan", lat: 48.8566, lng: 2.3522 },
  { name: "Berlin Metropolitan", lat: 52.5200, lng: 13.4050 },
  { name: "Madrid Metropolitan", lat: 40.4168, lng: -3.7038 },
  { name: "Rome Metropolitan", lat: 41.9028, lng: 12.4964 },
  
  // Asia
  { name: "Tokyo Metropolitan", lat: 35.6762, lng: 139.6503 },
  { name: "Beijing Metropolitan", lat: 39.9042, lng: 116.4074 },
  { name: "Shanghai Metropolitan", lat: 31.2304, lng: 121.4737 },
  { name: "Seoul Metropolitan", lat: 37.5665, lng: 126.9780 },
  { name: "Mumbai Metropolitan", lat: 19.0760, lng: 72.8777 },
  { name: "Singapore Metropolitan", lat: 1.3521, lng: 103.8198 },
  
  // Oceania
  { name: "Sydney Metropolitan", lat: -33.8688, lng: 151.2093 },
  { name: "Melbourne Metropolitan", lat: -37.8136, lng: 144.9631 },
  { name: "Auckland Metropolitan", lat: -36.8509, lng: 174.7645 },
  
  // South America
  { name: "São Paulo Metropolitan", lat: -23.5505, lng: -46.6333 },
  { name: "Buenos Aires Metropolitan", lat: -34.6037, lng: -58.3816 },
  { name: "Rio de Janeiro Metropolitan", lat: -22.9068, lng: -43.1729 },
  
  // Africa
  { name: "Cairo Metropolitan", lat: 30.0444, lng: 31.2357 },
  { name: "Lagos Metropolitan", lat: 6.5244, lng: 3.3792 },
  { name: "Cape Town Metropolitan", lat: -33.9249, lng: 18.4241 },
  // Additional regions
  { name: "Dubai Metropolitan", lat: 25.2048, lng: 55.2708 },
  { name: "Moscow Metropolitan", lat: 55.7558, lng: 37.6173 },
  { name: "Istanbul Metropolitan", lat: 41.0082, lng: 28.9784 },
  { name: "Bangkok Metropolitan", lat: 13.7563, lng: 100.5018 },
  { name: "Jakarta Metropolitan", lat: -6.2088, lng: 106.8456 },
  { name: "Manila Metropolitan", lat: 14.5995, lng: 120.9842 },
  { name: "Johannesburg Metropolitan", lat: -26.2041, lng: 28.0473 },
  { name: "Nairobi Metropolitan", lat: -1.2921, lng: 36.8219 },
  { name: "Casablanca Metropolitan", lat: 33.5731, lng: -7.5898 },
  { name: "Lima Metropolitan", lat: -12.0464, lng: -77.0428 },
  { name: "Santiago Metropolitan", lat: -33.4489, lng: -70.6693 },
  { name: "Bogotá Metropolitan", lat: 4.7110, lng: -74.0721 },
];

const RegionSelector = () => {
  const [open, setOpen] = useState(false);
  const [regionName, setRegionName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<typeof commonRegions[0] | null>(null);

  const handleRegionSelect = (region: typeof commonRegions[0]) => {
    setSelectedRegion(region);
    setRegionName(region.name);
    setLatitude(region.lat.toString());
    setLongitude(region.lng.toString());
    setOpen(false);
  };

  const handleAddRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to add a region");
      }

      const { error } = await supabase.from("monitored_regions").insert({
        region_name: regionName,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseFloat(radius),
        user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Region added successfully",
      });

      // Reset form
      setRegionName("");
      setLatitude("");
      setLongitude("");
      setRadius("");
      setSelectedRegion(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Add Monitoring Region</h3>
      <div className="space-y-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {regionName || "Select a region..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search regions..." />
              <CommandList>
                <CommandEmpty>No region found.</CommandEmpty>
                <CommandGroup>
                  {commonRegions.map((region) => (
                    <RegionListItem
                      key={region.name}
                      region={region}
                      isSelected={selectedRegion?.name === region.name}
                      onSelect={handleRegionSelect}
                    />
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <RegionForm
          latitude={latitude}
          longitude={longitude}
          radius={radius}
          onLatitudeChange={setLatitude}
          onLongitudeChange={setLongitude}
          onRadiusChange={setRadius}
          onSubmit={handleAddRegion}
        />
      </div>

      <SavedRegionsList />
    </Card>
  );
};

export default RegionSelector;
