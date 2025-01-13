import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";

interface SavedRegion {
  id: string;
  region_name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

const SavedRegionsList = () => {
  const [savedRegions, setSavedRegions] = useState<SavedRegion[]>([]);

  const fetchSavedRegions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("monitored_regions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch saved regions",
        variant: "destructive",
      });
      return;
    }

    setSavedRegions(data || []);
  };

  const handleDelete = async (regionId: string) => {
    const { error } = await supabase
      .from("monitored_regions")
      .delete()
      .eq("id", regionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete region",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Region deleted successfully",
    });
    fetchSavedRegions();
  };

  useEffect(() => {
    fetchSavedRegions();
  }, []);

  if (savedRegions.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 mt-4">
      <h4 className="text-sm font-semibold mb-2">Saved Regions</h4>
      <div className="space-y-2">
        {savedRegions.map((region) => (
          <div
            key={region.id}
            className="flex items-center justify-between p-2 bg-secondary rounded-md"
          >
            <div>
              <p className="font-medium">{region.region_name}</p>
              <p className="text-sm text-muted-foreground">
                {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)} ({region.radius}km)
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(region.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SavedRegionsList;