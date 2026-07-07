export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiBaseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
  openAiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePriceFree: process.env.STRIPE_PRICE_FREE ?? "",
  stripePriceMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
  stripePriceAnnual: process.env.STRIPE_PRICE_PRO_ANNUAL ?? "",
  stripeWritingPack: process.env.STRIPE_PRICE_WRITING_PACK ?? "",
  stripeSpeakingPack: process.env.STRIPE_PRICE_SPEAKING_PACK ?? "",
};

export const hasSupabaseEnv = Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const hasStripeEnv = Boolean(env.stripeSecretKey);
export const hasOpenAiEnv = Boolean(env.openAiApiKey);
