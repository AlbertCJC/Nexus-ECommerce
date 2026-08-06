import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function cleanupTestProducts() {
  // Delete test products
  const { data: products, error: selectError } = await supabase
    .from('products')
    .select('id')
    .ilike('name', 'Test Product for Delete%')

  if (selectError) {
    console.error('Select error:', selectError)
    return
  }

  console.log('Found test products:', products?.length)

  if (products && products.length > 0) {
    const ids = products.map(p => p.id)
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .in('id', ids)

    if (deleteError) {
      console.error('Delete error:', deleteError)
    } else {
      console.log('Deleted', ids.length, 'test products')
    }
  }

  // Also delete test category
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', 'Test Category for Delete%')

  if (categories && categories.length > 0) {
    const catIds = categories.map(c => c.id)
    const { error: catDelError } = await supabase
      .from('categories')
      .delete()
      .in('id', catIds)

    if (catDelError) {
      console.error('Category delete error:', catDelError)
    } else {
      console.log('Deleted', catIds.length, 'test categories')
    }
  }
}

cleanupTestProducts()