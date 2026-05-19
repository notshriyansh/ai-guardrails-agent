import OpenAI from "openai";

import { env } from "../config/env";

export const groq = new OpenAI({
  apiKey: env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});
