import { Check } from "lucide-react";
import { CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface RegionListItemProps {
  region: {
    name: string;
    lat: number;
    lng: number;
  };
  isSelected: boolean;
  onSelect: (region: { name: string; lat: number; lng: number }) => void;
}

const RegionListItem = ({ region, isSelected, onSelect }: RegionListItemProps) => {
  return (
    <CommandItem key={region.name} onSelect={() => onSelect(region)}>
      <Check
        className={cn(
          "mr-2 h-4 w-4",
          isSelected ? "opacity-100" : "opacity-0"
        )}
      />
      {region.name}
    </CommandItem>
  );
};

export default RegionListItem;