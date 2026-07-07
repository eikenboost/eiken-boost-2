export const analyticsEvents = [
  "onboarding_completed",
  "assessment_started",
  "assessment_completed",
  "first_study_started",
  "study_completed",
  "paywall_viewed",
  "paywall_closed",
  "subscription_started",
  "annual_selected",
  "monthly_selected",
  "free_continue_selected",
  "annual_checkout_started",
  "monthly_checkout_started",
  "paywall_context_type",
  "paywall_weakness_personalized",
  "paywall_reoffer_shown",
  "writing_used",
  "speaking_used",
  "credit_pack_purchased",
  "streak_day_reached",
] as const;

export type AnalyticsEventName = (typeof analyticsEvents)[number];

export async function trackEvent(eventName: AnalyticsEventName, context: Record<string, unknown> = {}) {
  // Hook point: send to Supabase, PostHog, Segment, or your own API.
  if (process.env.NODE_ENV !== "production") {
    console.debug(`[analytics] ${eventName}`, context);
  }
  return { eventName, context };
}
