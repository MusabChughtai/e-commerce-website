import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Read env variables (they are injected at build/preview time in next-lite)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ezreatxlayefvmljtnwu.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cmVhdHhsYXllZnZtbGp0bnd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzOTU1NTQsImV4cCI6MjA2Nzk3MTU1NH0.MsUDYxzNb67dchc4dSWcvVK7ujMWnOZ1qGucP0KngS8"

/**
 * Provide a graceful fallback in the local/preview environment so the app
 * doesn’t crash when the developer hasn’t supplied Supabase credentials yet.
 * All DB calls will still fail, but with clear messaging.
 */
function createSafeClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    // eslint-disable-next-line no-console
    console.warn(
      `[Supabase] Environment variables "NEXT_PUBLIC_SUPABASE_URL" and/or ` +
        `"NEXT_PUBLIC_SUPABASE_ANON_KEY" are missing. ` +
        `Supabase features are disabled.\n` +
        `Add them in your project settings or a .env.local file.`,
    )
    // Point at a dummy public project so constructor does not throw
    return createClient("https://demo.supabase.co", "public-anon-key")
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSafeClient()

export type Product = {
  id: string
  name: string
  description: string
  price: number
  image: string
  full_description: string
  dimensions: string
  created_at?: string
  updated_at?: string
}
