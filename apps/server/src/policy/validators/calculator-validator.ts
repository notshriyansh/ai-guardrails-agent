export function validateCalculatorArguments(
  args: Record<string, unknown>,
): string | undefined {
  const expression = String(
    args.expression ?? "",
  ).trim();

  if (!expression) {
    return "Calculator expression is required";
  }

  const dangerousPatterns = [
    "process",
    "require",
    "global",
    "import",
    "fetch",
    "eval",
    "function",
    "constructor",
    "child_process",
    "fs",
    "exec",
    "spawn",
    "window",
    "document",
  ];

  const matchedPattern =
    dangerousPatterns.find(
      (pattern) =>
        expression
          .toLowerCase()
          .includes(pattern),
    );

  if (matchedPattern) {
    return `Suspicious calculator input detected (${matchedPattern})`;
  }

  return undefined;
}