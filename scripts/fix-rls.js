import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Try to run raw SQL via rpc (if exec_sql function exists)
async function fixRls() {
  // First, let's try to see what functions exist
  const { data: functions, error: fnError } = await supabase.rpc('exec_sql', {
    sql: "SELECT 1"
  })
  console.log('Functions test:', functions, fnError)

  // Try to update the policy
  const sql = `
    drop policy if exists "admin products update" on products;
    create policy "admin products update" on products for update using (
      auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    ) with check (
      auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    );
  `

  const { data, error } = await supabase.rpc('exec_sql', { sql })
  console.log('Result:', data, error)
}

fixRls()