/**
 * Utility functions for parsing and formatting AI errors into human-friendly messages.
 * Prevents raw technical API responses, JSON blobs, Google RPC dumps, or metric URLs
 * from leaking into the user interface.
 */

export type AiErrorDetails = {
  isQuotaExceeded: boolean;
  isRateLimited: boolean;
  isOverloaded: boolean;
  isAuthError: boolean;
  retryTime?: string;
  statusCode: number;
  friendlyMessage: string;
};

/**
 * Extracts a human-friendly retry duration (e.g. "11h 40m", "45s") from error text.
 */
function extractRetryTime(text: string): string | undefined {
  if (!text || typeof text !== "string") return undefined;

  // Pattern 1: Google's "Please retry in 11h40m23.775264271s" or "retry in 35s"
  const textMatch = text.match(
    /retry in\s+(?:(\d+)\s*d\s*)?(?:(\d+)\s*h\s*)?(?:(\d+)\s*m\s*)?(?:(\d+(?:\.\d+)?)\s*s)?/i
  );
  if (textMatch) {
    const [, days, hours, mins, secs] = textMatch;
    const parts: string[] = [];
    if (days && parseInt(days, 10) > 0) parts.push(`${parseInt(days, 10)}d`);
    if (hours && parseInt(hours, 10) > 0) parts.push(`${parseInt(hours, 10)}h`);
    if (mins && parseInt(mins, 10) > 0) parts.push(`${parseInt(mins, 10)}m`);
    if (parts.length === 0 && secs) {
      parts.push(`${Math.round(parseFloat(secs))}s`);
    }
    if (parts.length > 0) return parts.join(" ");
  }

  // Pattern 2: "retryDelay": "42023s"
  const secMatch = text.match(/"retryDelay"\s*:\s*"(\d+)s"/i);
  if (secMatch) {
    const totalSecs = parseInt(secMatch[1], 10);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    if (parts.length === 0 && secs > 0) parts.push(`${secs}s`);
    if (parts.length > 0) return parts.join(" ");
  }

  return undefined;
}

/**
 * Parses any error (Error instance, JSON string, or object) and returns structured,
 * clean human-friendly details.
 */
export function parseAiError(
  error: unknown,
  fallbackMessage = "Failed to communicate with AI styling service."
): AiErrorDetails {
  let rawText = "";
  let statusCode = 500;
  let parsedJson: Record<string, unknown> | null = null;

  if (typeof error === "string") {
    rawText = error;
  } else if (error instanceof Error) {
    rawText = error.message;
  } else if (error && typeof error === "object") {
    rawText = JSON.stringify(error);
  }

  // Attempt to parse raw text if it looks like JSON
  const trimmed = rawText.trim();
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      parsedJson = JSON.parse(trimmed);
    } catch {
      // not valid JSON, proceed with rawText
    }
  }

  // Check embedded error objects (e.g., from Google GenAI SDK: { error: { code: 429, message: "...", status: "RESOURCE_EXHAUSTED" } })
  const innerError =
    parsedJson && typeof parsedJson.error === "object" && parsedJson.error !== null
      ? (parsedJson.error as Record<string, unknown>)
      : null;

  const codeVal = innerError?.code ?? (parsedJson?.status || parsedJson?.statusCode);
  if (typeof codeVal === "number") {
    statusCode = codeVal;
  }

  const statusStr = String(innerError?.status || parsedJson?.status || "").toUpperCase();
  const searchCorpus = `${rawText} ${statusStr}`.toLowerCase();

  const retryTime = extractRetryTime(rawText);

  // Check 1: Quota / Resource Exhausted / 429
  const isQuotaExceeded =
    statusCode === 429 ||
    statusStr === "RESOURCE_EXHAUSTED" ||
    searchCorpus.includes("resource_exhausted") ||
    searchCorpus.includes("exceeded your current quota") ||
    searchCorpus.includes("quota exceeded") ||
    searchCorpus.includes("freetier") ||
    searchCorpus.includes("generaterequestsperday");

  const isRateLimited =
    !isQuotaExceeded &&
    (searchCorpus.includes("rate limit") ||
      searchCorpus.includes("too many requests") ||
      searchCorpus.includes("per minute"));

  // Check 2: Service Overloaded / Unavailable
  const isOverloaded =
    statusCode === 503 ||
    statusStr === "UNAVAILABLE" ||
    searchCorpus.includes("overloaded") ||
    searchCorpus.includes("high demand") ||
    searchCorpus.includes("temporarily unavailable");

  // Check 3: Authentication / API Key issues
  const isAuthError =
    statusCode === 401 ||
    statusCode === 403 ||
    statusStr === "PERMISSION_DENIED" ||
    statusStr === "UNAUTHENTICATED" ||
    searchCorpus.includes("api_key") ||
    searchCorpus.includes("api key") ||
    searchCorpus.includes("permission denied");

  // Check 4: Network / Fetch failure
  const isNetworkError =
    searchCorpus.includes("failed to fetch") ||
    searchCorpus.includes("econnrefused") ||
    searchCorpus.includes("enotfound") ||
    searchCorpus.includes("network error");

  // Build the user-friendly message
  let friendlyMessage = fallbackMessage;

  if (isQuotaExceeded) {
    statusCode = 429;
    if (retryTime) {
      friendlyMessage = `AI daily quota reached: Google Gemini request limit has been reached for today. Please retry in approximately ${retryTime}, or continue manually.`;
    } else {
      friendlyMessage =
        "AI daily quota reached: The daily request limit has been reached. Please try again later, or continue manually.";
    }
  } else if (isRateLimited) {
    statusCode = 429;
    friendlyMessage =
      "The AI service is receiving too many requests right now. Please wait a few seconds and try again.";
  } else if (isOverloaded) {
    statusCode = 503;
    friendlyMessage =
      "AI models are currently experiencing high demand. Please try again in a few moments.";
  } else if (isAuthError) {
    statusCode = 401;
    friendlyMessage =
      "AI authentication error. Please verify the Gemini API key in your server environment.";
  } else if (isNetworkError) {
    friendlyMessage =
      "Unable to reach the AI styling service. Please check your internet connection and try again.";
  } else if (searchCorpus.includes("empty response") || searchCorpus.includes("invalid format")) {
    friendlyMessage =
      "AI returned an incomplete response. Please try again or adjust your criteria.";
  } else if (
    searchCorpus.includes("not an image") ||
    searchCorpus.includes("retrieve the clothing image")
  ) {
    friendlyMessage =
      "Could not process the uploaded photo. Please ensure it is a clear image file (JPG, PNG, or WEBP).";
  } else {
    // If rawText is already clean human-readable sentence (not raw JSON or stack trace), use it
    const isStackTrace = /\n\s*at\s+/.test(rawText) || /^\s*at\s+[\w.<>]+/.test(rawText);
    const isCleanMessage =
      rawText &&
      !rawText.includes("{") &&
      !rawText.includes("}") &&
      !rawText.includes("https://") &&
      !rawText.includes("googleapis.com") &&
      !isStackTrace &&
      rawText.length < 200;

    if (isCleanMessage) {
      friendlyMessage = rawText;
    }
  }

  return {
    isQuotaExceeded,
    isRateLimited,
    isOverloaded,
    isAuthError,
    retryTime,
    statusCode,
    friendlyMessage,
  };
}

/**
 * Returns a clean, user-friendly error string for display or API responses.
 */
export function formatAiError(
  error: unknown,
  fallbackMessage = "An error occurred with the AI service. Please try again."
): string {
  return parseAiError(error, fallbackMessage).friendlyMessage;
}
