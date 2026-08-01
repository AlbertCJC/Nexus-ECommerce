import { useAppContext } from '../../context/AppContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categorySchema } from '../../utils/validation'
import { getCategoryName } from '../../utils/helpers'
import { Table } from '../../components/ui/Table'
import { Modal, ConfirmDialog } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { generateId } from '../../utils/helpers'
import { useState, useMemo } from 'react'

export function AdminCategories() {
  const { categories, products, dispatch, addToast } = useAppContext()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '' }
  })

  const categoryProductCounts = useMemo(() => {
    const counts = {}
    products.forEach(p => { counts[p.categoryId] = (counts[p.categoryId] || 0) + 1 })
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

  const onSubmit = (data) => {
    if (editingCategory) {
      dispatch({ type: 'UPDATE_CATEGORY', payload: { ...data, id: editingCategory.id } })
      addToast({ type: 'success', message: 'Category updated' })
    } else {
      dispatch({ type: 'ADD_CATEGORY', payload: { ...data, id: generateId('cat-') } })
      addToast({ type: 'success', message: 'Category created' })
    }
    setModalOpen(false)
  }

  const confirmDelete = (category) => setDeleteConfirm(category)
  const executeDelete = () => {
    if (deleteConfirm) {
      dispatch({ type: 'DELETE_CATEGORY', payload: deleteConfirm.id })
      addToast({ type: 'success', message: 'Category deleted' })
      setDeleteConfirm(null)
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description', render: (v) => v || '—' },
    { key: 'productCount', header: 'Products', render: (_, row) => categoryProductCounts[row.id] || 0 },
    { key: 'actions', header: 'Actions', render: (_, row) => {
      const count = categoryProductCounts[row.id] || 0
      const hasProducts = count > 0
      return (
        <div className="flex items-center gap-2">
          <button onClick={() => openEditModal(row)} className="p-1.5 text-slate-500 hover:text-primary-600" aria-label="Edit"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
          <button onClick={() => confirmDelete(row)} disabled={hasProducts} className={`p-1.5 ${hasProducts ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-red-600'}`} aria-label="Delete" aria-disabled={hasProducts}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          {hasProducts && <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" title={`Cannot delete: ${count} product(s) in this category`}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        </div>
      )
    }},
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500">Manage product categories</p>
        </div>
        <Button onClick={openAddModal}><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Add Category</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table columns={columns} data={categories} keyField="id" emptyMessage="No categories yet" />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCategory ? 'Edit Category' : 'Add Category'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name *" {...register('name')} error={errors.name?.message} />
          <div><label className="label">Description</label><textarea {...register('description')} rows={3} className="input" placeholder="Category description..." /></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingCategory ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={executeDelete} title="Delete Category" message={`Delete "${deleteConfirm?.name}"? This will fail if products are assigned.`} confirmText="Delete" variant="danger" />
    </div>
  )
}