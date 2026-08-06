import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { brandSchema } from '../../utils/validation'
import { generateId } from '../../utils/helpers'
import { Table } from '../../components/ui/Table'
import { Modal, ConfirmDialog } from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useState, useMemo } from 'react'
import { useBrands, useProducts, useCreateBrand, useUpdateBrand, useDeleteBrand, useUploadImage, useInvalidateQueries } from '../../hooks'

export default function AdminBrands() {
  const { data: brands = [], isLoading } = useBrands()
  const { data: products = [] } = useProducts({ status: 'all' })

  const createBrandMutation = useCreateBrand()
  const updateBrandMutation = useUpdateBrand()
  const deleteBrandMutation = useDeleteBrand()
  const uploadImageMutation = useUploadImage()
  const { invalidateBrands } = useInvalidateQueries()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoPreview, setLogoPreview] = useState('')

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: '', logo_url: '', description: '' }
  })

  const watchedLogoUrl = watch('logo_url')

  const brandProductCounts = useMemo(() => {
    const counts = {}
    products.forEach(p => { counts[p.brand_id] = (counts[p.brand_id] || 0) + 1 })
    return counts
  }, [products])

  const openAddModal = () => {
    setEditingBrand(null)
    reset()
    setLogoPreview('')
    setModalOpen(true)
  }

  const openEditModal = (brand) => {
    setEditingBrand(brand)
    reset({
      ...brand,
      logo_url: brand.logo_url,
    })
    setLogoPreview(brand.logo_url)
    setModalOpen(true)
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLogoUploading(true)
    try {
      const path = `brands/${Date.now()}-${file.name}`
      const url = await uploadImageMutation.mutateAsync({ bucket: 'brand-logos', path, file })
      setValue('logo_url', url)
      setLogoPreview(url)
    } catch (error) {
      console.error('Logo upload failed:', error)
      alert('Failed to upload logo')
    } finally {
      setLogoUploading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      if (editingBrand) {
        await updateBrandMutation.mutateAsync({ ...data, id: editingBrand.id })
      } else {
        await createBrandMutation.mutateAsync(data)
      }
      invalidateBrands()
      setModalOpen(false)
    } catch (error) {
      console.error('Brand save failed:', error)
      alert('Failed to save brand: ' + error.message)
    }
  }

  const confirmDelete = (brand) => setDeleteConfirm(brand)
  const executeDelete = async () => {
    if (deleteConfirm) {
      try {
        const count = brandProductCounts[deleteConfirm.id] || 0
        if (count > 0) {
          alert(`Cannot delete brand with ${count} product(s)`)
          setDeleteConfirm(null)
          return
        }
        await deleteBrandMutation.mutateAsync(deleteConfirm.id)
        invalidateBrands()
        setDeleteConfirm(null)
      } catch (error) {
        console.error('Delete failed:', error)
        alert('Failed to delete brand: ' + error.message)
      }
    }
  }

  const columns = [
    { key: 'logo_url', header: 'Logo', render: (v) => v ? <img src={v} alt="" className="w-8 h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} /> : '—' },
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description', render: (v) => v || '—' },
    { key: 'productCount', header: 'Products', render: (_, row) => brandProductCounts[row.id] || 0 },
    { key: 'actions', header: 'Actions', render: (_, row) => {
      const count = brandProductCounts[row.id] || 0
      const hasProducts = count > 0
      return (
        <div className="flex items-center gap-2">
          <button onClick={() => openEditModal(row)} className="p-1.5 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent-primary))]" aria-label="Edit"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
          <button onClick={() => confirmDelete(row)} disabled={hasProducts} className={`p-1.5 ${hasProducts ? 'text-[rgb(var(--text-muted))] cursor-not-allowed' : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent-danger))]'}`} aria-label="Delete" aria-disabled={hasProducts}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          {hasProducts && <svg className="w-4 h-4 text-[rgb(var(--accent-warning))]" fill="none" stroke="currentColor" viewBox="0 0 24 24" title={`Cannot delete: ${count} product(s) in this brand`}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        </div>
      )
    }},
  ]

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgb(var(--accent-primary))] border-t-transparent" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Brands</h1>
          <p className="text-[rgb(var(--text-muted))]">Manage product brands</p>
        </div>
        <Button onClick={openAddModal}><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Add Brand</Button>
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={brands} keyField="id" emptyMessage="No brands yet" />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingBrand ? 'Edit Brand' : 'Add Brand'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name *" {...register('name')} error={errors.name?.message} />
          <div>
            <label className="label">Logo URL *</label>
            <div className="flex gap-2">
              <Input type="url" {...register('logo_url')} error={errors.logo_url?.message} placeholder="https://example.com/logo.svg" className="flex-1" />
              <Button type="button" variant="secondary" onClick={() => document.getElementById('brand-logo-upload').click()} disabled={logoUploading}>
                {logoUploading ? 'Uploading...' : 'Upload'}
              </Button>
              <input id="brand-logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </div>
            {logoPreview && (
              <div className="mt-2">
                <img src={logoPreview} alt="Preview" className="w-20 h-20 object-contain rounded border border-[rgb(var(--border-subtle))]" />
              </div>
            )}
          </div>
          <div><label className="label">Description</label><textarea {...register('description')} rows={3} className="input" placeholder="Brand description..." /></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[rgb(var(--border-subtle))]">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createBrandMutation.isPending || updateBrandMutation.isPending}>{editingBrand ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={executeDelete} title="Delete Brand" message={`Delete "${deleteConfirm?.name}"? This will fail if products are assigned.`} confirmText="Delete" variant="danger" />
    </div>
  )
}