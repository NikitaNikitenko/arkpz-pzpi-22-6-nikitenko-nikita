import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  loading?: boolean;
  error?: boolean;
  badge?: {
    text: string;
    variant?: "low" | "medium" | "high";
  };
}

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor, 
  badge,
  loading = false,
  error = false
}: StatCardProps) => {
  if (loading) {
    return (
      <Card className="p-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          {badge && <Skeleton className="h-5 w-16" />}
        </div>
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-4 w-32" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 hover:shadow-lg transition-shadow duration-300 bg-destructive/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <h3 className="font-semibold text-sm text-destructive">{title}</h3>
          </div>
        </div>
        <p className="text-sm text-destructive">Failed to load data</p>
        <p className="text-xs text-destructive/80">Please try again later</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon className={`h-4 w-4 ${iconColor}`} />
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        {badge && (
          <Badge 
            variant="outline" 
            className={`bg-alert-${badge.variant}/10 text-alert-${badge.variant} text-xs`}
          >
            {badge.text}
          </Badge>
        )}
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </Card>
  );
};

export default StatCard;