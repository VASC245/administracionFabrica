import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ohwcyhrzexdoxkweeqbd.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9od2N5aHJ6ZXhkb3hrd2VlcWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NDU5NTgsImV4cCI6MjA2OTQyMTk1OH0.QIeFq6d79No1TSMPe_35rzpIXYM9aHON154KYJJVVhQ' // Usa la anon key de Supabase

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
