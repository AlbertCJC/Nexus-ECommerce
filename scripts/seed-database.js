import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dlqjmtnwcekcndpchxgr.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscWptdG53Y2VrY25kcGNoeGdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTc2ODgxOCwiZXhwIjoyMTAxMzQ0ODE4fQ.9Oe_I35WsQaJAYDs2pCMB0UseQbpjkHTRjjLLIWjHdA'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const brands = [
  { id: 'brand-razer', name: 'Razer', logo: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/brand-logos/razer.webp', description: 'Premium gaming peripherals & laptops' },
  { id: 'brand-logitech', name: 'Logitech G', logo: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/brand-logos/logitech-g.webp', description: 'Professional gaming gear' },
  { id: 'brand-asus', name: 'ASUS ROG', logo: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/brand-logos/asus-rog.webp', description: 'Republic of Gamers hardware' },
  { id: 'brand-corsair', name: 'Corsair', logo: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/brand-logos/corsair.webp', description: 'High-performance PC components' },
  { id: 'brand-steelseries', name: 'SteelSeries', logo: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/brand-logos/steelseries.webp', description: 'Esports-grade peripherals' },
  { id: 'brand-hyperx', name: 'HyperX', logo: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/brand-logos/hyperx.webp', description: 'Gaming headsets & accessories' },
  { id: 'brand-msi', name: 'MSI', logo: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/brand-logos/msi.webp', description: 'Gaming laptops, motherboards & graphics cards' },
  { id: 'brand-gigabyte', name: 'GIGABYTE', logo: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/brand-logos/gigabyte.webp', description: 'Motherboards, graphics cards & laptops' },
  { id: 'brand-coolermaster', name: 'Cooler Master', logo: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/brand-logos/cooler-master.webp', description: 'PC cooling, cases & peripherals' }
]

const categories = [
  { id: 'cat-mice', name: 'Gaming Mice', description: 'High-precision gaming mice for every grip style' },
  { id: 'cat-keyboards', name: 'Gaming Keyboards', description: 'Mechanical & optical keyboards with RGB' },
  { id: 'cat-headsets', name: 'Gaming Headsets', description: 'Immersive audio with crystal-clear mics' },
  { id: 'cat-monitors', name: 'Gaming Monitors', description: 'High refresh rate, low latency displays' },
  { id: 'cat-laptops', name: 'Laptops & PCs', description: 'Gaming laptops and pre-built systems' },
  { id: 'cat-components', name: 'Components', description: 'GPUs, RAM, SSDs, PSUs & cooling' },
  { id: 'cat-accessories', name: 'Accessories', description: 'Mousepads, cables, stands & more' }
]

const products = [
  { id: 'prod-1', name: 'Razer DeathAdder V3 Pro', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-1.webp', categoryId: 'cat-mice', brandId: 'brand-razer', description: 'Ultra-lightweight 63g ergonomic gaming mouse with Focus Pro 30K Optical Sensor, Optical Mouse Switches Gen-3, and up to 90 hours battery life.', price: 9490, stock: 25, status: 'active', createdAt: '2024-01-15T10:00:00Z' },
  { id: 'prod-2', name: 'Razer Viper V3 Pro', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-2.webp', categoryId: 'cat-mice', brandId: 'brand-razer', description: 'Symmetrical ultra-lightweight 54g esports gaming mouse with Focus Pro 35K Optical Sensor, Optical Mouse Switches Gen-3, and 95 hours battery.', price: 9490, stock: 18, status: 'active', createdAt: '2024-03-01T10:00:00Z' },
  { id: 'prod-3', name: 'Logitech G Pro X Superlight 2', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-3.webp', categoryId: 'cat-mice', brandId: 'brand-logitech', description: 'Sub-60g wireless gaming mouse with HERO 2 sensor (32K DPI), LIGHTFORCE hybrid switches, and 95 hour battery life.', price: 8990, stock: 30, status: 'active', createdAt: '2024-05-10T10:00:00Z' },
  { id: 'prod-4', name: 'Logitech G502 X PLUS', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-4.webp', categoryId: 'cat-mice', brandId: 'brand-logitech', description: 'Iconic shape evolved with LIGHTFORCE hybrid switches, HERO 25K sensor, 13 programmable controls, and LIGHTSYNC RGB.', price: 7490, stock: 25, status: 'active', createdAt: '2024-04-15T10:00:00Z' },
  { id: 'prod-5', name: 'ASUS ROG Keris II Ace', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-5.webp', categoryId: 'cat-mice', brandId: 'brand-asus', description: '54g ultralight wireless gaming mouse with ROG AimPoint 42K sensor, optical micro switches, and 100 hour battery.', price: 6990, stock: 20, status: 'active', createdAt: '2024-06-01T10:00:00Z' },
  { id: 'prod-6', name: 'SteelSeries Aerox 9 Wireless', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-6.webp', categoryId: 'cat-mice', brandId: 'brand-steelseries', description: 'Multi-genre MMO mouse with 18 programmable TrueMove Air sensor (18K CPI), 180-hour battery, and AquaBarrier protection.', price: 7990, stock: 15, status: 'active', createdAt: '2024-03-20T10:00:00Z' },
  { id: 'prod-7', name: 'Cooler Master MM720', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-7.webp', categoryId: 'cat-mice', brandId: 'brand-coolermaster', description: 'Ultra-light 49g honeycomb shell mouse with PixArt 16K sensor, PTFE feet, and Ultraweave cable.', price: 2990, stock: 40, status: 'active', createdAt: '2024-02-10T10:00:00Z' },
  { id: 'prod-8', name: 'Razer BlackWidow V4 Pro', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-8.webp', categoryId: 'cat-keyboards', brandId: 'brand-razer', description: 'Full-size mechanical gaming keyboard with Razer Green Switches, per-key RGB, command dial, 8 programmable macro keys, and magnetic wrist rest.', price: 12990, stock: 15, status: 'active', createdAt: '2024-01-20T10:00:00Z' },
  { id: 'prod-9', name: 'Razer Huntsman V3 Pro TKL', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-9.webp', categoryId: 'cat-keyboards', brandId: 'brand-razer', description: 'Tenkeyless analog optical gaming keyboard with Razer Analog Optical Switches Gen-2, 8000Hz polling rate, and doubleshot PBT keycaps.', price: 11490, stock: 20, status: 'active', createdAt: '2024-02-15T10:00:00Z' },
  { id: 'prod-10', name: 'Logitech G Pro X TKL LIGHTSPEED', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-10.webp', categoryId: 'cat-keyboards', brandId: 'brand-logitech', description: 'Tenkeyless pro gaming keyboard with GX optical switches, LIGHTSPEED wireless, 8000Hz polling, and PBT keycaps.', price: 9990, stock: 18, status: 'active', createdAt: '2024-05-20T10:00:00Z' },
  { id: 'prod-11', name: 'ASUS ROG Azoth', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-11.webp', categoryId: 'cat-keyboards', brandId: 'brand-asus', description: '75% DIY wireless keyboard with gasket mount, ROG NX switches, OLED display, and 3-mode connectivity.', price: 13990, stock: 12, status: 'active', createdAt: '2024-06-10T10:00:00Z' },
  { id: 'prod-12', name: 'Corsair K70 RGB PRO', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-12.webp', categoryId: 'cat-keyboards', brandId: 'brand-corsair', description: 'Full-size mechanical keyboard with CHERRY MX switches, 8000Hz polling, PBT doubleshot keycaps, and aluminum frame.', price: 8990, stock: 22, status: 'active', createdAt: '2024-04-20T10:00:00Z' },
  { id: 'prod-13', name: 'SteelSeries Apex Pro TKL (2023)', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-13.webp', categoryId: 'cat-keyboards', brandId: 'brand-steelseries', description: 'Tenkeyless with OmniPoint 2.0 adjustable actuation, OLED smart display, and premium aluminum alloy frame.', price: 11990, stock: 16, status: 'active', createdAt: '2024-03-15T10:00:00Z' },
  { id: 'prod-14', name: 'Razer Kraken V4 Pro', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-14.webp', categoryId: 'cat-headsets', brandId: 'brand-razer', description: 'Wireless gaming headset with OLED control hub, Razer TriForce Bio-cellulose 50mm drivers, HyperClear Super Wideband Mic, and 70-hour battery.', price: 19990, stock: 10, status: 'active', createdAt: '2024-02-01T10:00:00Z' },
  { id: 'prod-15', name: 'Logitech G Pro X 2 LIGHTSPEED', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-15.webp', categoryId: 'cat-headsets', brandId: 'brand-logitech', description: 'Pro-grade wireless headset with 50mm Graphene drivers, DTS Headphone:X 2.0, Blue VO!CE mic, and 50-hour battery.', price: 14990, stock: 14, status: 'active', createdAt: '2024-05-15T10:00:00Z' },
  { id: 'prod-16', name: 'ASUS ROG Delta S Wireless', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-16.webp', categoryId: 'cat-headsets', brandId: 'brand-asus', description: 'Dual-mode wireless headset with MQA audio, ESS 9281 QUAD DAC, AI noise-canceling mic, and 25-hour battery.', price: 11990, stock: 16, status: 'active', createdAt: '2024-06-05T10:00:00Z' },
  { id: 'prod-17', name: 'HyperX Cloud III Wireless', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-17.webp', categoryId: 'cat-headsets', brandId: 'brand-hyperx', description: 'Wireless gaming headset with 53mm drivers, DTS Headphone:X, 120-hour battery, and memory foam ear cushions.', price: 8990, stock: 25, status: 'active', createdAt: '2024-04-01T10:00:00Z' },
  { id: 'prod-18', name: 'SteelSeries Arctis Nova Pro Wireless', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-18.webp', categoryId: 'cat-headsets', brandId: 'brand-steelseries', description: 'Premium wireless with 360° spatial audio, active noise cancellation, dual battery system, and GameDAC Gen 2.', price: 21990, stock: 8, status: 'active', createdAt: '2024-03-25T10:00:00Z' },
  { id: 'prod-19', name: 'ASUS ROG Swift PG27AQDP', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-19.webp', categoryId: 'cat-monitors', brandId: 'brand-asus', description: '27" 1440p 480Hz OLED gaming monitor with 0.03ms response, G-SYNC, 99% DCI-P3, and custom heatsink.', price: 49990, stock: 5, status: 'active', createdAt: '2024-07-01T10:00:00Z' },
  { id: 'prod-20', name: 'MSI MPG 271QRX QD-OLED', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-20.webp', categoryId: 'cat-monitors', brandId: 'brand-msi', description: '27" 1440p 360Hz QD-OLED with 0.03ms GTG, VESA DisplayHDR True Black 400, and KVM switch.', price: 44990, stock: 6, status: 'active', createdAt: '2024-06-15T10:00:00Z' },
  { id: 'prod-21', name: 'GIGABYTE AORUS FO27Q3', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-21.webp', categoryId: 'cat-monitors', brandId: 'brand-gigabyte', description: '27" 1440p 360Hz QD-OLED with tactical features, 0.03ms response, and 98.5% DCI-P3.', price: 39990, stock: 7, status: 'active', createdAt: '2024-06-20T10:00:00Z' },
  { id: 'prod-22', name: 'Corsair VENGEANCE RGB DDR5 32GB (2x16GB) 6000MHz', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-22.webp', categoryId: 'cat-components', brandId: 'brand-corsair', description: 'High-performance DDR5 memory with dynamic 10-zone RGB, Intel XMP 3.0, and aluminum heatspreader.', price: 8990, stock: 35, status: 'active', createdAt: '2024-04-25T10:00:00Z' },
  { id: 'prod-23', name: 'MSI GeForce RTX 4070 Ti SUPER 16G GAMING X SLIM', image: 'https://dlQjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-23.webp', categoryId: 'cat-components', brandId: 'brand-msi', description: 'NVIDIA Ada Lovelace GPU with 16GB GDDR6X, TRI FROZR 3 cooling, 2.5-slot design, and DLSS 3.5 support.', price: 59990, stock: 4, status: 'active', createdAt: '2024-07-10T10:00:00Z' },
  { id: 'prod-24', name: 'GIGABYTE AORUS Gen5 10000 2TB SSD', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-24.webp', categoryId: 'cat-components', brandId: 'brand-gigabyte', description: 'PCIe 5.0 NVMe SSD with 10,000 MB/s read, 9,500 MB/s write, graphene-aluminum heatsink, and 5-year warranty.', price: 12990, stock: 12, status: 'active', createdAt: '2024-05-25T10:00:00Z' },
  { id: 'prod-25', name: 'Razer Strider Large Chroma', image: 'https://dlqjmtnwcekcndpchxgr.supabase.co/storage/v1/object/public/product-images/prod-25.webp', categoryId: 'cat-accessories', brandId: 'brand-razer', description: 'Large hybrid mouse mat with Chroma RGB (19 zones), micro-texture surface, non-slip base, and magnetic cable catch.', price: 3490, stock: 30, status: 'active', createdAt: '2024-03-30T10:00:00Z' }
]

async function seedDatabase() {
  console.log('Starting database seed...')
  console.log(`Seeding ${brands.length} brands, ${categories.length} categories, ${products.length} products`)

  // Seed brands
  console.log('\n=== Seeding Brands ===')
  for (const brand of brands) {
    const { error } = await supabase
      .from('brands')
      .upsert({
        id: brand.id,
        name: brand.name,
        logo_url: brand.logo,
        description: brand.description,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (error) {
      console.error(`Failed to upsert brand ${brand.name}:`, error.message)
    } else {
      console.log(`✓ ${brand.name}`)
    }
  }

  // Seed categories
  console.log('\n=== Seeding Categories ===')
  for (const category of categories) {
    const { error } = await supabase
      .from('categories')
      .upsert({
        id: category.id,
        name: category.name,
        description: category.description,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (error) {
      console.error(`Failed to upsert category ${category.name}:`, error.message)
    } else {
      console.log(`✓ ${category.name}`)
    }
  }

  // Seed products
  console.log('\n=== Seeding Products ===')
  for (const product of products) {
    const { error } = await supabase
      .from('products')
      .upsert({
        id: product.id,
        name: product.name,
        image_url: product.image,
        category_id: product.categoryId,
        brand_id: product.brandId,
        description: product.description,
        price_cents: product.price,
        stock: product.stock,
        status: product.status,
        created_at: product.createdAt
      }, { onConflict: 'id' })

    if (error) {
      console.error(`Failed to upsert product ${product.name}:`, error.message)
    } else {
      console.log(`✓ ${product.name}`)
    }
  }

  console.log('\n=== Seed Complete ===')
}

seedDatabase().catch(console.error)