// lib/supabase/admin.js
import { createClient } from "@supabase/supabase-js";

// This client uses SERVICE ROLE KEY and can bypass RLS
// Use ONLY in server actions for admin operations
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // Service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
