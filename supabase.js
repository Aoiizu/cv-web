import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'https://hwuuwypxssfztpacxjke.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3dXV3eXB4c3NmenRwYWN4amtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTMzNDcsImV4cCI6MjA5NTQ2OTM0N30.X21WO_wyIi1RtwF-2vaIU2jAQgVcescI5pSrzSEpizw'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)