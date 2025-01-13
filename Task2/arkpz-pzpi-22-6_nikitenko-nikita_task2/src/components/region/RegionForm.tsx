import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RegionFormProps {
  latitude: string;
  longitude: string;
  radius: string;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
  onRadiusChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const RegionForm = ({
  latitude,
  longitude,
  radius,
  onLatitudeChange,
  onLongitudeChange,
  onRadiusChange,
  onSubmit,
}: RegionFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => onLatitudeChange(e.target.value)}
            placeholder="e.g., 37.7749"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => onLongitudeChange(e.target.value)}
            placeholder="e.g., -122.4194"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="radius">Monitoring Radius (km)</Label>
        <Input
          id="radius"
          type="number"
          step="any"
          value={radius}
          onChange={(e) => onRadiusChange(e.target.value)}
          placeholder="e.g., 50"
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Add Region
      </Button>
    </form>
  );
};

export default RegionForm;