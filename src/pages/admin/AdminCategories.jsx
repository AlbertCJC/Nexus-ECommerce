import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categorySchema } from '../../utils/validation'
import { getCategoryName } from '../../utils/helpers'
import { Table } from '../../components/ui/Table'
import { Modal, ConfirmDialog } from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useState, useMemo } from 'react'
import { useCategories, useProducts, useCreateCategory, useUpdateCategory, useDeleteCategory, useInvalidateQueries } from '../../hooks'
import { useAppContext } from '../../context/AppContext'
import { getAvailableIcons, getCategoryIcon } from '../../utils/categoryIcons'

export default function AdminCategories() {
  const { data: categories = [], isLoading } = useCategories()
  const { data: products = [] } = useProducts({ status: 'all' })

  const createCategoryMutation = useCreateCategory()
  const updateCategoryMutation = useUpdateCategory()
  const deleteCategoryMutation = useDeleteCategory()
  const { invalidateCategories } = useInvalidateQueries()
  const { addToast } = useAppContext()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '', icon_key: '' }
  })

  const categoryProductCounts = useMemo(() => {
    const counts = {}
    products.forEach(p => { counts[p.category_id] = (counts[p.category_id] || 0) + 1 })
    return counts
  }, [products])

  const openAddModal = () => {
    setEditingCategory(null)
    reset()
    setModalOpen(true)
  }

  const openEditModal = (category) => {
    setEditingCategory(category)
    reset(category)
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({ ...data, id: editingCategory.id })
        addToast({ type: 'success', message: 'Category updated successfully' })
      } else {
        await createCategoryMutation.mutateAsync(data)
        addToast({ type: 'success', message: 'Category created successfully' })
      }
      invalidateCategories()
      setModalOpen(false)
    } catch (error) {
      console.error('Category save failed:', error)
      addToast({ type: 'error', message: 'Failed to save category: ' + error.message })
    }
  }

  const confirmDelete = (category) => setDeleteConfirm(category)
  const executeDelete = async () => {
    if (deleteConfirm) {
      try {
        await deleteCategoryMutation.mutateAsync(deleteConfirm.id)
        invalidateCategories()
        setDeleteConfirm(null)
        addToast({ type: 'success', message: 'Category deleted successfully' })
      } catch (error) {
        console.error('Delete failed:', error)
        addToast({ type: 'error', message: 'Failed to delete category: ' + error.message })
      }
    }
  }

  const columns = [
    { key: 'icon', header: 'Icon', render: (_, row) => {
      const IconComponent = getCategoryIcon(row);
      return <IconComponent className="w-6 h-6 text-[rgb(var(--accent-primary))]" />;
    }},
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description', render: (v) => v || '—' },
    { key: 'icon_key', header: 'Icon Key', render: (v) => v || '—' },
    { key: 'productCount', header: 'Products', render: (_, row) => categoryProductCounts[row.id] || 0 },
    { key: 'actions', header: 'Actions', render: (_, row) => {
      const count = categoryProductCounts[row.id] || 0
      const hasProducts = count > 0
      return (
        <div className="flex items-center gap-2">
          <button onClick={() => openEditModal(row)} className="p-1.5 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent-primary))]" aria-label="Edit"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
          <button onClick={() => confirmDelete(row)} disabled={hasProducts} className={`p-1.5 ${hasProducts ? 'text-[rgb(var(--text-muted))] cursor-not-allowed' : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent-danger))]'}`} aria-label="Delete" aria-disabled={hasProducts}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          {hasProducts && <svg className="w-4 h-4 text-[rgb(var(--accent-warning))]" fill="none" stroke="currentColor" viewBox="0 0 24 24" title={`Cannot delete: ${count} product(s) in this category`}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
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
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Categories</h1>
          <p className="text-[rgb(var(--text-muted))]">Manage product categories</p>
        </div>
        <Button onClick={openAddModal}><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Add Category</Button>
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={categories} keyField="id" emptyMessage="No categories yet" />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCategory ? 'Edit Category' : 'Add Category'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name *" {...register('name')} error={errors.name?.message} />
          <div><label className="label">Description</label><textarea {...register('description')} rows={3} className="input" placeholder="Category description..." /></div>
          <div>
            <label className="label">Icon</label>
            <select {...register('icon_key')} className="input">
              <option value="">— Auto (based on name) —</option>
              {getAvailableIcons().map(iconName => (
                <option key={iconName} value={iconName}>{iconName}</option>
              ))}
            </select>
            <p className="text-sm text-[rgb(var(--text-muted))] mt-1">Leave empty to auto-assign based on category name</p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[rgb(var(--border-subtle))]">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createCategoryMutation.isPending || updateCategoryMutation.isPending}>{editingCategory ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={executeDelete} title="Delete Category" message={`Delete "${deleteConfirm?.name}"? This will fail if products are assigned.`} confirmText="Delete" variant="danger" />
    </div>
  )
}