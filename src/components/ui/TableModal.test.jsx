import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import { Table } from './Table'
import { Modal, ConfirmDialog } from './Modal'

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('Table', () => {
  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'actions', header: 'Actions', render: (id) => <button data-testid={`action-${id}`}>Action</button> },
  ]

  const data = [
    { id: '1', name: 'John', email: 'john@example.com' },
    { id: '2', name: 'Jane', email: 'jane@example.com' },
  ]

  it('renders table headers', () => {
    render(<Table columns={columns} data={data} keyField="id" />)
    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('renders table rows', () => {
    render(<Table columns={columns} data={data} keyField="id" />)
    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Jane')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('renders empty message when no data', () => {
    render(<Table columns={columns} data={[]} keyField="id" emptyMessage="No items" />)
    expect(screen.getByText('No items')).toBeInTheDocument()
  })

  it('calls onRowClick when row clicked', () => {
    const handleClick = vi.fn()
    render(<Table columns={columns} data={data} keyField="id" onRowClick={handleClick} />)
    const rows = screen.getAllByRole('row')
    fireEvent.click(rows[1]) // First data row
    expect(handleClick).toHaveBeenCalledWith(data[0])
  })

  it('uses custom render function for column', () => {
    const columnsWithRender = [
      { key: 'name', header: 'Name', render: (v) => <strong>{v.toUpperCase()}</strong> },
    ]
    render(<Table columns={columnsWithRender} data={data} keyField="id" />)
    expect(screen.getByText('JOHN')).toBeInTheDocument()
  })

  it('applies custom column className', () => {
    const columnsWithClass = [
      { key: 'name', header: 'Name', className: 'custom-col' },
    ]
    render(<Table columns={columnsWithClass} data={data} keyField="id" />)
    expect(screen.getByText('John')).toHaveClass('custom-col')
  })
})

describe('Modal', () => {
  it('renders nothing when not open', () => {
    render(<Modal isOpen={false} onClose={vi.fn()} title="Test" />)
    expect(screen.queryByText('Test')).not.toBeInTheDocument()
  })

  it('renders modal when open', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} title="Test Modal" />)
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close modal' })).toBeInTheDocument()
  })

  it('renders children', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} title="Test">Modal Content</Modal>)
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn()
    render(<Modal isOpen={true} onClose={onClose} title="Test" />)
    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('applies size classes', () => {
    const { container } = render(<Modal isOpen={true} onClose={vi.fn()} title="Test Small" size="sm" />)
    expect(container.querySelector('.max-w-md')).toBeInTheDocument()

    cleanup()

    render(<Modal isOpen={true} onClose={vi.fn()} title="Test Large" size="lg" />)
    expect(document.querySelector('.max-w-2xl')).toBeInTheDocument()
  })
})

describe('ConfirmDialog', () => {
  it('renders nothing when not open', () => {
    render(<ConfirmDialog isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} title="Confirm" message="Are you sure?" />)
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
  })

  it('renders confirmation message', () => {
    render(<ConfirmDialog isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Confirm" message="Are you sure?" />)
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('shows confirm and cancel buttons', () => {
    render(<ConfirmDialog isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Confirm" message="Are you sure?" confirmText="Yes" />)
    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('calls onConfirm when confirm clicked', () => {
    const onConfirm = vi.fn()
    render(<ConfirmDialog isOpen={true} onClose={vi.fn()} onConfirm={onConfirm} title="Confirm" message="Are you sure?" />)
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('calls onClose when cancel clicked', () => {
    const onClose = vi.fn()
    render(<ConfirmDialog isOpen={true} onClose={onClose} onConfirm={vi.fn()} title="Confirm" message="Are you sure?" />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('disables buttons when loading', () => {
    render(<ConfirmDialog isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Confirm" message="Are you sure?" loading />)
    const confirmBtn = screen.getByRole('button', { name: '...' })
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' })
    expect(confirmBtn).toBeDisabled()
    expect(cancelBtn).toBeDisabled()
    expect(confirmBtn).toHaveTextContent('...')
  })

  it('applies variant class to confirm button', () => {
    render(<ConfirmDialog isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Confirm" message="Are you sure?" variant="danger" />)
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveClass('btn-danger')
  })
})