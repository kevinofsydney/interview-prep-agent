export type JsonParseResult =
  | { ok: true; json: unknown }
  | { ok: false; raw: string; error: string };

export function parseJsonResponse(text: string): JsonParseResult {
  const trimmed = text.trim();
  const candidate = extractJsonCandidate(trimmed);

  try {
    return { ok: true, json: JSON.parse(candidate) };
  } catch (error) {
    const repaired = attemptJsonRepair(candidate);
    if (repaired) {
      try {
        return { ok: true, json: JSON.parse(repaired) };
      } catch {
        // Fall through to the original parse error.
      }
    }
    return { ok: false, raw: text, error: error instanceof Error ? error.message : "Invalid JSON" };
  }
}

function extractJsonCandidate(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return text;
}

function attemptJsonRepair(text: string) {
  const firstObject = text.indexOf("{");
  const lastObject = text.lastIndexOf("}");
  const firstArray = text.indexOf("[");
  const lastArray = text.lastIndexOf("]");

  if (firstObject >= 0 && lastObject > firstObject) {
    return text.slice(firstObject, lastObject + 1);
  }

  if (firstArray >= 0 && lastArray > firstArray) {
    return text.slice(firstArray, lastArray + 1);
  }

  return null;
}
