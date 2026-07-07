export const analyticsEvents = [
  "onboarding_completed",
  "assessment_started",
  "assessment_completed",
  "first_study_started",
  "study_completed",
  "paywall_viewed",
  "subscription_started",
  "annual_selected",
  "writing_used",
  "speaking_used",
  "credit_pack_purchased",
  "streak_day_reached",
] as const;

export type AnalyticsEventName = (typeof analyticsEvents)[number];

export async function trackEvent(eventName: AnalyticsEventName, context: Record<string, unknown> = {}) {
  // Hook point: send to Supabase, PostHog, Segment, or your own API.
  return { eventName, context };
}
