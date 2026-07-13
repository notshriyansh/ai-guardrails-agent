import axios from "axios";
import "dotenv/config";

export async function weatherTool({ city }: { city: string }) {
  const apiKey = process.env.WEATHER_API_KEY;

  console.log("Weather API key length:", apiKey?.length);

  console.log("Weather city:", city);

  if (!apiKey) {
    throw new Error("Missing WEATHER_API_KEY");
  }

  const response = await axios.get(
    "https://api.weatherapi.com/v1/current.json",
    {
      params: {
        key: apiKey,
        q: city,
      },
    },
  );

  return {
    city: response.data.location.name,
    region: response.data.location.region,
    country: response.data.location.country,
    temperature: response.data.current.temp_c,
    condition: response.data.current.condition.text,
    humidity: response.data.current.humidity,
  };
}
