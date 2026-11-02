import { connectDB } from "@/lib/db";
import SystemMetric, { MetricType } from "@/models/SystemMetric";
import User from "@/models/User";

export interface TrackMetricInput {
  type: MetricType;
  endpoint?: string;
  userId?: string;
  durationMs: number;
  success: boolean;
  statusCode?: number;
  errorCode?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Dispatch an early-warning notification to a Discord / Slack webhook if an error occurs
 * or if AI recommendation latency spikes over acceptable thresholds.
 */
async function dispatchWebhookAlert(input: TrackMetricInput): Promise<void> {
  const webhookUrl =
    process.env.ALERT_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) return;

  const isError = !input.success;
  const isSlow = input.durationMs > 8000;

  // Only dispatch if there is an error or latency is severely degraded
  if (!isError && !isSlow) return;

  try {
    const title = isError
      ? `🚨 [System Alert] ${input.type.toUpperCase()} Failed`
      : `⚠️ [Latency Spike] Slow ${input.type.toUpperCase()} (${(input.durationMs / 1000).toFixed(1)}s)`;

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `**${title}**\n• **Endpoint:** \`${input.endpoint || "N/A"}\`\n• **Status:** \`${input.statusCode || (isError ? 500 : 200)}\`\n• **Error:** \`${input.errorMessage || input.errorCode || "None"}\`\n• **Latency:** \`${(input.durationMs / 1000).toFixed(2)}s\`\n• **Time:** <t:${Math.floor(Date.now() / 1000)}:R>`,
      }),
    });
  } catch (err) {
    // Alert dispatch should never crash or throw
    console.error("[Telemetry] Webhook alert dispatch failed:", err);
  }
}

/**
 * Record a system metric without ever throwing or blocking the main request flow.
 */
export async function trackMetric(input: TrackMetricInput): Promise<void> {
  try {
    await connectDB();

    // Create the metric document
    const metricPromise = SystemMetric.create({
      type: input.type,
      endpoint: input.endpoint,
      userId: input.userId,
      durationMs: Math.max(0, Math.round(input.durationMs)),
      success: input.success,
      statusCode: input.statusCode,
      errorCode: input.errorCode,
      errorMessage: input.errorMessage
        ? String(input.errorMessage).slice(0, 1000)
        : undefined,
      metadata: input.metadata,
      createdAt: new Date(),
    });

    // If a user ID is supplied, touch their lastActiveAt timestamp to keep DAU accurate
    const userTouchPromise = input.userId
      ? User.findByIdAndUpdate(input.userId, { lastActiveAt: new Date() }).catch(
          () => null
        )
      : Promise.resolve();

    // Early-warning alert webhook
    const alertPromise = dispatchWebhookAlert(input);

    await Promise.all([metricPromise, userTouchPromise, alertPromise]);
  } catch (error) {
    // Telemetry must never crash an application request
    console.error("[Telemetry] Failed to record metric:", error);
  }
}

/**
 * Measure execution duration of an async function and track its outcome.
 */
export async function timeExecution<T>(
  opts: {
    type: MetricType;
    endpoint?: string;
    userId?: string;
    metadata?: Record<string, unknown>;
  },
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const durationMs = performance.now() - start;

    // Fire-and-forget metric recording
    void trackMetric({
      type: opts.type,
      endpoint: opts.endpoint,
      userId: opts.userId,
      durationMs,
      success: true,
      statusCode: 200,
      metadata: opts.metadata,
    });

    return result;
  } catch (error: unknown) {
    const durationMs = performance.now() - start;
    const err = error as Error;

    void trackMetric({
      type: opts.type,
      endpoint: opts.endpoint,
      userId: opts.userId,
      durationMs,
      success: false,
      statusCode: 500,
      errorCode: err?.name || "UNKNOWN_ERROR",
      errorMessage: err?.message || String(error),
      metadata: opts.metadata,
    });

    // Re-throw so caller can handle their own error response
    throw error;
  }
}
