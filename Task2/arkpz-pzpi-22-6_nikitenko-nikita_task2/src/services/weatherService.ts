import { supabase } from "@/integrations/supabase/client";

export const fetchWeatherData = async (latitude: number, longitude: number) => {
  try {
    console.log('Invoking weather function with:', { latitude, longitude });
    const { data, error } = await supabase.functions.invoke('get-weather', {
      body: { latitude, longitude },
    });

    if (error) {
      console.error('Weather service error:', error);
      throw new Error(error.message || 'Failed to fetch weather data');
    }

    console.log('Weather data received:', data);
    return data;
  } catch (error: any) {
    console.error('Weather service error:', error);
    throw error;
  }
}