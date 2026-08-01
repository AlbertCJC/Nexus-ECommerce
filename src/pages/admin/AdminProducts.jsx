import { useAppContext } from '../../context/AppContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema } from '../../utils/validation'
import { formatCurrency, formatProductStatus, getCategoryName } from '../../utils/formatters'
import { Table } from '../../components/ui/Table'
import { Modal, ConfirmDialog } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { generateId } from '../../utils/helpers'
import { useState, useMemo } from 'react'

export function AdminProducts() {
  const { products, categories, dispatch, addToast } = useAppContext()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { status: 'active', stock: 0, price: 0 }
  })

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !categoryFilter || p.categoryId === categoryFilter
      const matchesStatus = !statusFilter || p.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [products, search, categoryFilter, statusFilter])

  const openAddModal = () => {
    setEditingProduct(null)
    reset({ status: 'active', stock: 0, price: 0, categoryId: categories[0]?.id || '' })
    setModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    reset({ ...product, price: product.price, stock: product.stock })
    setModalOpen(true)
  }

  const onSubmit = (data) => {
    if (editingProduct) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: { ...data, id: editingProduct.id, price: Number(data.price), stock: Number(data.stock) } })
      addToast({ type: 'success', message: 'Product updated successfully' })
    } else {
      dispatch({ type: 'ADD_PRODUCT', payload: { ...data, id: generateId('prod-'), price: Number(data.price), stock: Number(data.stock), createdAt: new Date().toISOString() } })
      addToast({ type: 'success', message: 'Product created successfully' })
    }
    setModalOpen(false)
  }

  const confirmDelete = (product) => setDeleteConfirm(product)
  const executeDelete = () => {
    if (deleteConfirm) {
      dispatch({ type: 'DELETE_PRODUCT', payload: deleteConfirm.id })
      addToast({ type: 'success', message: 'Product deleted' })
      setDeleteConfirm(null)
    }
  }

  const columns = [
    { key: 'image', header: 'Image', render: (v) => <img src={v} alt="" className="w-12 h-12 object-cover rounded" /> },
    { key: 'name', header: 'Name' },
    { key: 'categoryId', header: 'Category', render: (v) => getCategoryName(categories, v) },
    { key: 'price', header: 'Price', render: (v) => formatCurrency(v) },
    { key: 'stock', header: 'Stock' },
    { key: 'status', header: 'Status', render: (v) => { const s = formatProductStatus(v); return <Badge variant={s.class.replace('bg-','').replace('100','')}>{s.text}</Badge> } },
    { key: 'actions', header: 'Actions', render: (_, row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => openEditModal(row)} className="p-1.5 text-slate-500 hover:text-primary-600" aria-label="Edit"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
        <button onClick={() => confirmDelete(row)} className="p-1.5 text-slate-500 hover:text-red-600" aria-label="Delete"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500">Manage your product catalog</p>
        </div>
        <Button onClick={openAddModal}><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Add Product</Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid sm:grid-cols-4 gap-4">
          <Input label="Search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." />
          <Select label="Category" options={[{value:'',label:'All'},...categories.map(c=>({value:c.id,label:c.name}))]} value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} />
          <Select label="Status" options={[{value:'',label:'All'},{value:'active',label:'Active'},{value:'inactive',label:'Inactive'},{value:'out_of_stock',label:'Out of Stock'}]} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table columns={columns} data={filteredProducts} keyField="id" emptyMessage="No products found" />
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name *" {...register('name')} error={errors.name?.message} />
          <Input label="Image URL *" type="url" {...register('image')} error={errors.image?.message} placeholder="https://picsum.photos/seed/abc/400/400.jpg" />
          <Select label="Category *" options={categories.map(c => ({ value: c.id, label: c.name }))} {...register('categoryId')} error={errors.categoryId?.message} placeholder="Select category" />
          <div><label className="label">Description</label><textarea {...register('description')} rows={3} className="input" placeholder="Product description..." /></div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Price *" type="number" step="0.01" min="0" {...register('price', { valueAsNumber: true })} error={errors.price?.message} />
            <Input label="Stock *" type="number" min="0" {...register('stock', { valueAsNumber: true })} error={errors.stock?.message} />
            <Select label="Status *" options={[{value:'active',label:'Active'},{value:'inactive',label:'Inactive'},{value:'out_of_stock',label:'Out of Stock'}]} {...register('status')} error={errors.status?.message} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={false}>{editingProduct ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={executeDelete} title="Delete Product" message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`} confirmText="Delete" variant="danger" />
    </div>
  )
}