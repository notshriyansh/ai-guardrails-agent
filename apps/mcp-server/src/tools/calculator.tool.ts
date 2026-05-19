import { z } from "zod";

export const calculatorSchema = z.object({
  expression: z.string(),
});

export type CalculatorInput = z.infer<typeof calculatorSchema>;

export async function calculatorTool(input: CalculatorInput) {
  const validated = calculatorSchema.parse(input);
  const result = eval(validated.expression);

  return {
    result,
  };
}
