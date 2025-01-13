import { Database } from "@/integrations/supabase/types";

export type MonitoredRegion = Database["public"]["Tables"]["monitored_regions"]["Row"];
export type InsertMonitoredRegion = Database["public"]["Tables"]["monitored_regions"]["Insert"];
export type UpdateMonitoredRegion = Database["public"]["Tables"]["monitored_regions"]["Update"];

export interface IRegionRepository {
  getAllUserRegions(userId: string): Promise<MonitoredRegion[]>;
  getRegionById(regionId: string): Promise<MonitoredRegion | null>;
  createRegion(region: InsertMonitoredRegion): Promise<MonitoredRegion>;
  updateRegion(regionId: string, region: UpdateMonitoredRegion): Promise<MonitoredRegion | null>;
  deleteRegion(regionId: string): Promise<void>;
}