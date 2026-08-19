import { createServerClient } from "@supabase/ssr";
import { appScopedCookieName } from "@repo/database";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      // Must match getSupabaseBrowserClient()'s cookieOptions.name exactly (see
      // appScopedCookieName's own comment) -- otherwise this server client would never see the
      // session the browser just wrote, or worse, would fall back to reading the other apps'
      // shared default cookie name.
      cookieOptions: { name: appScopedCookieName() },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
