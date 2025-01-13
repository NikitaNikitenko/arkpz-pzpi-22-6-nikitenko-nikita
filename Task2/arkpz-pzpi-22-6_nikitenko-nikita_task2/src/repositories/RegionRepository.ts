import { supabase } from "@/integrations/supabase/client";
import { IRegionRepository, MonitoredRegion, InsertMonitoredRegion, UpdateMonitoredRegion } from "./types";

export class RegionRepository implements IRegionRepository {
  async getAllUserRegions(userId: string): Promise<MonitoredRegion[]> {
    console.log("Fetching all regions for user:", userId);
    
    const { data, error } = await supabase
      .from("monitored_regions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching regions:", error);
      throw new Error(`Failed to fetch regions: ${error.message}`);
    }

    return data;
  }

  async getRegionById(regionId: string): Promise<MonitoredRegion | null> {
    console.log("Fetching region by ID:", regionId);
    
    const { data, error } = await supabase
      .from("monitored_regions")
      .select("*")
      .eq("id", regionId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching region:", error);
      throw new Error(`Failed to fetch region: ${error.message}`);
    }

    return data;
  }

  async createRegion(region: InsertMonitoredRegion): Promise<MonitoredRegion> {
    console.log("Creating new region:", region);
    
    const { data, error } = await supabase
      .from("monitored_regions")
      .insert(region)
      .select()
      .single();

    if (error) {
      console.error("Error creating region:", error);
      throw new Error(`Failed to create region: ${error.message}`);
    }

    return data;
  }

  async updateRegion(regionId: string, region: UpdateMonitoredRegion): Promise<MonitoredRegion | null> {
    console.log("Updating region:", regionId, region);
    
    const { data, error } = await supabase
      .from("monitored_regions")
      .update(region)
      .eq("id", regionId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error updating region:", error);
      throw new Error(`Failed to update region: ${error.message}`);
    }

    return data;
  }

  async deleteRegion(regionId: string): Promise<void> {
    console.log("Deleting region:", regionId);
    
    const { error } = await supabase
      .from("monitored_regions")
      .delete()
      .eq("id", regionId);

    if (error) {
      console.error("Error deleting region:", error);
      throw new Error(`Failed to delete region: ${error.message}`);
    }
  }
}

// Створюємо єдиний екземпляр репозиторію для використання в додатку
export const regionRepository = new RegionRepository();