import { z } from "zod";

export const weatherSchema = z.object({
  city: z.string(),
});

export type WeatherInput = z.infer<typeof weatherSchema>;

export async function weatherTool(input: WeatherInput) {
  const validated = weatherSchema.parse(input);

  return {
    city: validated.city,
    temperature: 28,
    condition: "Sunny",
  };
}
