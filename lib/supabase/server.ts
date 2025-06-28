import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// We use a WeakMap to store clients by cookie store
// This allows garbage collection when a cookie store is no longer referenced
const clientCache = new WeakMap()

export function createClient() {
  const cookieStore = cookies()

  // Check if we already have a client for this cookie store
  if (clientCache.has(cookieStore)) {
    return clientCache.get(cookieStore)
  }

  // Create a new client for this cookie store
  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )

  // Cache the client for this cookie store
  clientCache.set(cookieStore, client)

  return client
}
