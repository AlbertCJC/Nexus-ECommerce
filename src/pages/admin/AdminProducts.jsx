import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema } from '../../utils/validation'
import { formatCurrency, formatProductStatus } from '../../utils/formatters'
import { getCategoryName, getBrandName } from '../../utils/helpers'
import { Table } from '../../components/ui/Table'
import { Modal, ConfirmDialog } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useState, useMemo } from 'react'
import { useProducts, useCategories, useBrands, useCreateProduct, useUpdateProduct, useDeleteProduct, useUploadImage, useInvalidateQueries } from '../../hooks'
import { useAppContext } from '../../context/AppContext'
import { getCategoryIcon, getCategoryIconByName } from '../../utils/categoryIcons'

export default function AdminProducts() {
  const { data: products = [], isLoading: productsLoading } = useProducts({ status: 'all' })
  const { data: categories = [] } = useCategories()
  const { data: brands = [] } = useBrands()

  const createProductMutation = useCreateProduct()
  const updateProductMutation = useUpdateProduct()
  const deleteProductMutation = useDeleteProduct()
  const uploadImageMutation = useUploadImage()
  const { invalidateProducts } = useInvalidateQueries()
  const { addToast } = useAppContext()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState('')

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { status: 'active', stock: 0, price_cents: 0, image_url: '' }
  })

  const watchedImageUrl = watch('image_url')

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !categoryFilter || p.category_id === categoryFilter
      const matchesBrand = !brandFilter || p.brand_id === brandFilter
      const matchesStatus = !statusFilter || p.status === statusFilter
      return matchesSearch && matchesCategory && matchesBrand && matchesStatus
    })
  }, [products, search, categoryFilter, brandFilter, statusFilter])

  const openAddModal = () => {
    setEditingProduct(null)
    reset({ status: 'active', stock: 0, price_cents: 0, image_url: '', category_id: categories[0]?.id || '', brand_id: brands[0]?.id || '' })
    setImagePreview('')
    setModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    reset({
      ...product,
      price_cents: product.price_cents / 100,
      stock: product.stock,
      image_url: product.image_url,
      category_id: product.category_id,
      brand_id: product.brand_id,
    })
    setImagePreview(product.image_url)
    setModalOpen(true)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImageUploading(true)
    try {
      const path = `products/${Date.now()}-${file.name}`
      const url = await uploadImageMutation.mutateAsync({ bucket: 'product-images', path, file })
      setValue('image_url', url)
      setImagePreview(url)
    } catch (error) {
      console.error('Image upload failed:', error)
      addToast({ type: 'error', message: 'Failed to upload image' })
    } finally {
      setImageUploading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      // Convert PHP to cents
      const priceInCents = Math.round(data.price_cents * 100)
      const payload = { ...data, price_cents: priceInCents }

      if (editingProduct) {
        await updateProductMutation.mutateAsync({ ...payload, id: editingProduct.id })
        addToast({ type: 'success', message: 'Product updated successfully' })
      } else {
        await createProductMutation.mutateAsync(payload)
        addToast({ type: 'success', message: 'Product created successfully' })
      }
      invalidateProducts()
      setModalOpen(false)
    } catch (error) {
      console.error('Product save failed:', error)
      addToast({ type: 'error', message: 'Failed to save product: ' + error.message })
    }
  }

  const confirmDelete = (product) => setDeleteConfirm(product)
  const executeDelete = async () => {
    if (deleteConfirm) {
      try {
        await deleteProductMutation.mutateAsync(deleteConfirm.id)
        invalidateProducts()
        setDeleteConfirm(null)
        addToast({ type: 'success', message: 'Product deleted successfully' })
      } catch (error) {
        console.error('Delete failed:', error)
        addToast({ type: 'error', message: 'Failed to delete product: ' + error.message })
      }
    }
  }

  const columns = [
    { key: 'image_url', header: 'Image', render: (v) => <img src={v} alt="" className="w-12 h-12 object-cover rounded" onError={(e) => { e.currentTarget.src = '/images/placeholder-product.svg' }} /> },
    { key: 'name', header: 'Name' },
    { key: 'category_id', header: 'Category', render: (v) => {
      const cat = categories.find(c => c.id === v);
      const IconComponent = cat ? getCategoryIcon(cat) : getCategoryIconByName('mice');
      return <span className="flex items-center gap-2"><IconComponent className="w-4 h-4 text-[rgb(var(--text-muted))]" />{getCategoryName(categories, v)}</span>;
    }},
    { key: 'brand_id', header: 'Brand', render: (v) => getBrandName(brands, v) },
    { key: 'price_cents', header: 'Price', render: (v) => formatCurrency(v / 100) },
    { key: 'stock', header: 'Stock' },
    { key: 'status', header: 'Status', render: (v) => {
        const statusVariants = {
          active: 'success',
          inactive: 'neutral',
          out_of_stock: 'danger'
        }
        const statusLabels = {
          active: 'Active',
          inactive: 'Inactive',
          out_of_stock: 'Out of Stock'
        }
        const variant = statusVariants[v] || 'neutral'
        const label = statusLabels[v] || v
        return <Badge variant={variant}>{label}</Badge>
      } },
    { key: 'actions', header: 'Actions', render: (_, row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => openEditModal(row)} className="p-1.5 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent-primary))]" aria-label="Edit"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
        <button onClick={() => confirmDelete(row)} className="p-1.5 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent-danger))]" aria-label="Delete"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
      </div>
    )},
  ]

  if (productsLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgb(var(--accent-primary))] border-t-transparent" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Products</h1>
          <p className="text-[rgb(var(--text-muted))]">Manage your product catalog</p>
        </div>
        <Button onClick={openAddModal}><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Add Product</Button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid sm:grid-cols-5 gap-4">
          <Input label="Search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." />
          <Select label="Category" options={[{value:'',label:'All'},...categories.map(c=>({value:c.id,label:c.name}))]} value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} />
          <Select label="Brand" options={[{value:'',label:'All'},...brands.map(b=>({value:b.id,label:b.name}))]} value={brandFilter} onChange={e=>setBrandFilter(e.target.value)} />
          <Select label="Status" options={[{value:'',label:'All'},{value:'active',label:'Active'},{value:'inactive',label:'Inactive'},{value:'out_of_stock',label:'Out of Stock'}]} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <Table columns={columns} data={filteredProducts} keyField="id" emptyMessage="No products found" />
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name *" {...register('name')} error={errors.name?.message} />
          <div>
            <label className="label">Image URL *</label>
            <div className="flex gap-2">
              <Input type="url" {...register('image_url')} error={errors.image_url?.message} placeholder="https://example.com/image.jpg" className="flex-1" />
              <Button type="button" variant="secondary" onClick={() => document.getElementById('product-image-upload').click()} disabled={imageUploading}>
                {imageUploading ? 'Uploading...' : 'Upload'}
              </Button>
              <input id="product-image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded border border-[rgb(var(--border-subtle))]" />
              </div>
            )}
          </div>
          <Select label="Category *" options={categories.map(c => ({ value: c.id, label: c.name }))} {...register('category_id')} error={errors.category_id?.message} placeholder="Select category" />
          <Select label="Brand *" options={brands.map(b => ({ value: b.id, label: b.name }))} {...register('brand_id')} error={errors.brand_id?.message} placeholder="Select brand" />
          <div><label className="label">Description</label><textarea {...register('description')} rows={3} className="input" placeholder="Product description..." /></div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Price (PHP) *" type="number" step="0.01" min="0" {...register('price_cents', { valueAsNumber: true })} error={errors.price_cents?.message} placeholder="e.g. 1299.00" />
            <Input label="Stock *" type="number" min="0" {...register('stock', { valueAsNumber: true })} error={errors.stock?.message} />
            <Select label="Status *" options={[{value:'active',label:'Active'},{value:'inactive',label:'Inactive'},{value:'out_of_stock',label:'Out of Stock'}]} {...register('status')} error={errors.status?.message} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[rgb(var(--border-subtle))]">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createProductMutation.isPending || updateProductMutation.isPending}>{editingProduct ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={executeDelete} title="Delete Product" message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`} confirmText="Delete" variant="danger" />
    </div>
  )
}