import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || "8080",
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
};
