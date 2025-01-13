import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

console.log("Weather function starting...")

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { latitude, longitude } = await req.json()
    console.log('Received request with params:', { latitude, longitude })

    const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY')
    console.log('API Key present:', !!OPENWEATHER_API_KEY)
    
    if (!OPENWEATHER_API_KEY) {
      console.error('OpenWeather API key not configured')
      throw new Error('OpenWeather API key not configured')
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHER_API_KEY}`
    console.log('Fetching weather data from URL:', url.replace(OPENWEATHER_API_KEY, '[REDACTED]'))
    
    const response = await fetch(url)
    const responseText = await response.text()
    
    if (!response.ok) {
      console.error('Weather API error response:', responseText)
      throw new Error(`Weather API error: ${responseText}`)
    }

    const data = JSON.parse(responseText)
    console.log('Weather API response received:', data)
    
    const result = {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
    }
    
    console.log('Processed weather data:', result)
    
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})