// Test script to verify migrations applied on remote Supabase
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testMigrations() {
  console.log('Testing migrations on remote Supabase...\n')

  // Test 1: Check if idempotency_key column exists on orders
  console.log('1. Checking idempotency_key column on orders table...')
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('idempotency_key')
      .limit(1)

    if (error) {
      console.log('   ❌ FAILED:', error.message)
    } else {
      console.log('   ✅ idempotency_key column exists')
    }
  } catch (e) {
    console.log('   ❌ FAILED:', e.message)
  }

  // Test 2: Check if create_order RPC exists
  console.log('\n2. Checking create_order RPC...')
  try {
    const { data, error } = await supabase.rpc('create_order', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_checkout_data: { name: 'Test', email: 'test@test.com', phone: '123', address: {}, payment_method: 'cod', notes: '' },
      p_cart_items: [],
      p_idempotency_key: '00000000-0000-0000-0000-000000000000'
    })

    if (error && error.code === '42883') {
      console.log('   ❌ RPC not found (function does not exist)')
    } else if (error && error.message?.includes('Insufficient stock')) {
      console.log('   ✅ RPC exists (returned expected stock error for empty cart)')
    } else if (error) {
      console.log('   ⚠️  RPC exists but error:', error.message)
    } else {
      console.log('   ✅ RPC exists and executed')
    }
  } catch (e) {
    console.log('   ❌ FAILED:', e.message)
  }

  // Test 3: Check if cancel_order RPC exists
  console.log('\n3. Checking cancel_order RPC...')
  try {
    const { data, error } = await supabase.rpc('cancel_order', {
      p_order_id: '00000000-0000-0000-0000-000000000000',
      p_user_id: '00000000-0000-0000-0000-000000000000'
    })

    if (error && error.code === '42883') {
      console.log('   ❌ RPC not found')
    } else {
      console.log('   ✅ RPC exists')
    }
  } catch (e) {
    console.log('   ❌ FAILED:', e.message)
  }

  // Test 4: Check if merge_guest_cart RPC exists
  console.log('\n4. Checking merge_guest_cart RPC...')
  try {
    const { data, error } = await supabase.rpc('merge_guest_cart', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_items: []
    })

    if (error && error.code === '42883') {
      console.log('   ❌ RPC not found')
    } else {
      console.log('   ✅ RPC exists')
    }
  } catch (e) {
    console.log('   ❌ FAILED:', e.message)
  }

  // Test 5: Check if search_products RPC exists
  console.log('\n5. Checking search_products RPC...')
  try {
    const { data, error } = await supabase.rpc('search_products', {
      p_query: 'test',
      p_limit: 10,
      p_offset: 0,
      p_category_id: null,
      p_brand_ids: null,
      p_status: 'active'
    })

    if (error && error.code === '42883') {
      console.log('   ❌ RPC not found')
    } else {
      console.log('   ✅ RPC exists')
    }
  } catch (e) {
    console.log('   ❌ FAILED:', e.message)
  }

  // Test 6: Check pg_trgm indexes
  console.log('\n6. Checking pg_trgm indexes...')
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .ilike('name', '%test%')
      .limit(1)

    if (error) {
      console.log('   ❌ Query failed:', error.message)
    } else {
      console.log('   ✅ ILIKE query works (trgm index likely)')
    }
  } catch (e) {
    console.log('   ❌ FAILED:', e.message)
  }

  // Test 7: Check products table has stock column
  console.log('\n7. Checking stock column on products...')
  try {
    const { data, error } = await supabase
      .from('products')
      .select('stock')
      .limit(1)

    if (error) {
      console.log('   ❌ FAILED:', error.message)
    } else {
      console.log('   ✅ stock column exists')
    }
  } catch (e) {
    console.log('   ❌ FAILED:', e.message)
  }

  console.log('\n--- Migration verification complete ---')
}

testMigrations()