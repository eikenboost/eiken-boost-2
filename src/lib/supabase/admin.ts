import { createClient } from "@supabase/supabase-js";
import { env, hasSupabaseEnv } from "@/lib/env";

/**
 * Service-role Supabase client for trusted, server-only contexts (Stripe
 * checkout session creation, Stripe webhook handling). This bypasses Row
 * Level Security, so it must never be imported into client components or
 * exposed to the browser.
 */
export function createSupabaseAdminClient() {
  if (!hasSupabaseEnv || !env.supabaseServiceRole) return null;
  return createClient(env.supabaseUrl!, env.supabaseServiceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
