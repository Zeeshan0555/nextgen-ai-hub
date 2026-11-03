import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://buspmwcnkqlyqzgcexdr.supabase.co"
const supabaseKey = "sb_publishable_pNsJYYPvHE8SySw76UupvA_pjaVGsdy"

export const supabase = createClient(supabaseUrl, supabaseKey)
