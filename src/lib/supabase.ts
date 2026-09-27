import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  'https://xqhdznhjvgcsguclktsg.supabase.co'

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxaGR6bmhqdmdjc2d1Y2xrdHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0Mzc0MTIsImV4cCI6MjEwNjAxMzQxMn0.x3GeSz_UnraP70ul90jqr59mgV17_p4l41ke4te5yqA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

