import axios from "axios";
import "dotenv/config";

type WeatherToolInput = {
  city: string;
};

export async function weatherTool({
  city,
}: WeatherToolInput) {
  const apiKey = process.env.WEATHER_API_KEY;

  console.log(
    "Weather API key loaded:",
    Boolean(apiKey),
  );

  console.log(
    "Weather API key length:",
    apiKey?.length ?? 0,
  );

  console.log(
    "Weather city:",
    city,
  );

  if (!apiKey) {
    throw new Error(
      "Weather provider is not configured: WEATHER_API_KEY is missing",
    );
  }

  try {
    const response = await axios.get(
      "https://api.weatherapi.com/v1/current.json",
      {
        params: {
          key: apiKey,
          q: city,
        },
        timeout: 5000,
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
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const providerError =
        error.response?.data?.error;

      console.error(
        "Weather provider failed:",
        {
          status: error.response?.status,
          code: providerError?.code,
          message: providerError?.message,
        },
      );

      if (error.response?.status === 401) {
        throw new Error(
          "Weather provider rejected the API key",
        );
      }

      throw new Error(
        `Weather provider request failed with status ${error.response?.status ?? "unknown"}`,
      );
    }

    throw error;
  }
}