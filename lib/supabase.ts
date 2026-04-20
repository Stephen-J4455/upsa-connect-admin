import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://pkkffnpcgkwvnlwhtxwu.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBra2ZmbnBjZ2t3dm5sd2h0eHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3Njk0NzksImV4cCI6MjA5MTM0NTQ3OX0.WFP_eL57XA5P14WbI-sX9ZI208rIjTR2yv9IYSGvU2I";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
);
