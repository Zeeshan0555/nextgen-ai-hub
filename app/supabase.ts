import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_neuwire_SUPABASE_URL || 
  "https://placeholder-project.supabase.co"

const supabaseKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_neuwire_SUPABASE_URLSUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_neuwire_SUPABASE_PUBLISHABLE_KEY || 
  "placeholder-anon-key"

export const supabase = createClient(supabaseUrl, supabaseKey)
