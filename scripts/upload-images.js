import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SUPABASE_URL = 'https://dlqjmtnwcekcndpchxgr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscWptdG53Y2VrY25kcGNoeGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3Njg4MTgsImV4cCI6MjEwMTM0NDgxOH0.1ncobqKVTvf3cgb_cS1CHT42yrGv8euvFLPp9Ud7HME'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscWptdG53Y2VrY25kcGNoeGdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTc2ODgxOCwiZXhwIjoyMTAxMzQ0ODE4fQ.9Oe_I35WsQaJAYDs2pCMB0UseQbpjkHTRjjLLIWjHdA'

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const PROJECT_ROOT = path.resolve(__dirname, '..')
const PUBLIC_IMAGES_DIR = path.join(PROJECT_ROOT, 'public', 'images')

// Compression settings
const PRODUCT_COMPRESSION = {
  width: 800,
  height: 800,
  fit: 'inside',
  withoutEnlargement: true,
  webp: { quality: 80, effort: 4 },
  jpeg: { quality: 80, progressive: true },
  png: { quality: 80, compressionLevel: 9 }
}

const BRAND_COMPRESSION = {
  width: 400,
  height: 150,
  fit: 'inside',
  withoutEnlargement: true,
  png: { quality: 90, compressionLevel: 9 }
}

async function compressImage(inputPath, outputPath, options) {
  try {
    // If input is already webp and we're outputting webp, just copy it to avoid Windows rename issues
    const inputExt = path.extname(inputPath).toLowerCase()
    const outputExt = path.extname(outputPath).toLowerCase()

    if (inputExt === '.webp' && outputExt === '.webp') {
      fs.copyFileSync(inputPath, outputPath)
      const originalSize = fs.statSync(inputPath).size
      const compressedSize = fs.statSync(outputPath).size
      return { originalSize, compressedSize, savings: '0% (already WebP)' }
    }

    await sharp(inputPath)
      .resize(options.width, options.height, { fit: options.fit, withoutEnlargement: options.withoutEnlargement })
      .toFormat(path.extname(inputPath).slice(1) === 'png' ? 'png' : 'webp', options.webp || options.png || options.jpeg)
      .toFile(outputPath)

    const originalSize = fs.statSync(inputPath).size
    const compressedSize = fs.statSync(outputPath).size
    const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1)

    return { originalSize, compressedSize, savings: `${savings}%` }
  } catch (error) {
    console.error(`Failed to compress ${inputPath}:`, error.message)
    throw error
  }
}

async function uploadToStorage(bucket, filePath, fileName) {
  const fileBuffer = fs.readFileSync(filePath)
  const fileExt = path.extname(fileName)

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileName, fileBuffer, {
      contentType: fileExt === '.webp' ? 'image/webp' : fileExt === '.png' ? 'image/png' : 'image/jpeg',
      upsert: true
    })

  if (error) {
    throw new Error(`Upload failed for ${fileName}: ${error.message}`)
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName)
  return urlData.publicUrl
}

async function ensureBucketExists(bucketName) {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets()
  const exists = buckets?.some(b => b.name === bucketName)

  if (!exists) {
    const { error } = await supabaseAdmin.storage.createBucket(bucketName, { public: true })
    if (error && !error.message.includes('already exists')) {
      throw new Error(`Failed to create bucket ${bucketName}: ${error.message}`)
    }
    console.log(`Created bucket: ${bucketName}`)
  } else {
    console.log(`Bucket exists: ${bucketName}`)
  }
}

async function processProductImages() {
  console.log('\n=== Processing Product Images ===')
  const productsDir = path.join(PUBLIC_IMAGES_DIR, 'products')
  const files = fs.readdirSync(productsDir).filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f))

  await ensureBucketExists('product-images')

  const results = []
  for (const file of files) {
    const inputPath = path.join(productsDir, file)
    const outputName = path.parse(file).name + '.webp'
    const outputPath = path.join(productsDir, outputName)

    console.log(`\nCompressing: ${file}`)
    const stats = await compressImage(inputPath, outputPath, PRODUCT_COMPRESSION)
    console.log(`  Original: ${(stats.originalSize / 1024).toFixed(1)} KB -> Compressed: ${(stats.compressedSize / 1024).toFixed(1)} KB (${stats.savings} saved)`)

    console.log(`  Uploading to Supabase Storage...`)
    const publicUrl = await uploadToStorage('product-images', outputPath, outputName)
    console.log(`  ✓ Uploaded: ${publicUrl}`)

    results.push({ originalFile: file, publicUrl, outputName, ...stats })
  }

  return results
}

async function processBrandLogos() {
  console.log('\n=== Processing Brand Logos ===')
  const brandsDir = path.join(PUBLIC_IMAGES_DIR, 'brands')
  const files = fs.readdirSync(brandsDir).filter(f => /\.(svg|png)$/i.test(f))

  await ensureBucketExists('brand-logos')

  const results = []
  for (const file of files) {
    const inputPath = path.join(brandsDir, file)
    const outputName = path.parse(file).name + '.webp'
    const outputPath = path.join(brandsDir, outputName)

    console.log(`\nProcessing: ${file}`)
    // For SVGs, convert to WebP using sharp
    if (file.endsWith('.svg')) {
      const stats = await compressImage(inputPath, outputPath, BRAND_COMPRESSION)
      console.log(`  Compressed: ${(stats.originalSize / 1024).toFixed(1)} KB -> ${(stats.compressedSize / 1024).toFixed(1)} KB (${stats.savings} saved)`)
    } else {
      // Copy PNG as-is or compress
      fs.copyFileSync(inputPath, outputPath)
    }

    console.log(`  Uploading to Supabase Storage...`)
    const publicUrl = await uploadToStorage('brand-logos', outputPath, outputName)
    console.log(`  ✓ Uploaded: ${publicUrl}`)

    results.push({ originalFile: file, publicUrl, outputName })
  }

  return results
}

async function main() {
  console.log('Starting image upload to Supabase Storage...')
  console.log(`Project: ${SUPABASE_URL}`)

  try {
    const productResults = await processProductImages()
    const brandResults = await processBrandLogos()

    console.log('\n=== SUMMARY ===')
    console.log(`Products uploaded: ${productResults.length}`)
    console.log(`Brands uploaded: ${brandResults.length}`)

    // Generate mapping for seed data update
    console.log('\n=== SEED DATA MAPPING ===')
    console.log('\n// Product image URLs:')
    productResults.forEach(r => console.log(`  prod-${r.originalFile.match(/\d+/)?.[0] || r.originalFile}: '${r.publicUrl}',`))

    console.log('\n// Brand logo URLs:')
    brandResults.forEach(r => console.log(`  ${path.parse(r.originalFile).name}: '${r.publicUrl}',`))

    // Save mapping to JSON for reference
    const mapping = {
      products: productResults.reduce((acc, r) => {
        const num = r.originalFile.match(/\d+/)?.[0]
        if (num) acc[`prod-${num}`] = r.publicUrl
        return acc
      }, {}),
      brands: brandResults.reduce((acc, r) => {
        acc[path.parse(r.originalFile).name] = r.publicUrl
        return acc
      }, {})
    }

    fs.writeFileSync(
      path.join(PROJECT_ROOT, 'supabase-image-mapping.json'),
      JSON.stringify(mapping, null, 2)
    )
    console.log('\n✓ Mapping saved to supabase-image-mapping.json')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

main()