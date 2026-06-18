import { z } from "zod";

export const calculatorSchema = z.object({
  expression: z.string(),
});

export type CalculatorInput =
  z.infer<typeof calculatorSchema>;

export async function calculatorTool(
  input: CalculatorInput,
) {
  const validated =
    calculatorSchema.parse(input);

  const expression =
    validated.expression.trim();

  const safePattern =
    /^[0-9+\-*/().\s]+$/;

  if (!safePattern.test(expression)) {
    throw new Error(
      "Unsafe calculator expression",
    );
  }

  const result = Function(
    `"use strict"; return (${expression})`,
  )();

  return {
    result,
  };
}