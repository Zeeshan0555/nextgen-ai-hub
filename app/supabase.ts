import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.neurowire_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.neurowire_SUPABASE_ANON_KEY || "placeholder-key-to-prevent-build-error";

export const supabase = createClient(supabaseUrl, supabaseKey);
