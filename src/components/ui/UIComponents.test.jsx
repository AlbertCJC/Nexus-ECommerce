import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import Button from './Button'
import { Badge } from './Badge'
import Input from './Input'
import Select from './Select'
import { Card, CardHeader, CardBody, CardFooter } from './Card'
import { Spinner, Skeleton } from './Spinner'

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('UI Components', () => {
  describe('Button', () => {
    it('renders children', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('applies primary variant', () => {
      render(<Button variant="primary">Primary</Button>)
      expect(screen.getByRole('button', { name: 'Primary' })).toHaveClass('btn-primary')
    })

    it('applies secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      expect(screen.getByRole('button', { name: 'Secondary' })).toHaveClass('btn-secondary')
    })

    it('applies danger variant', () => {
      render(<Button variant="danger">Danger</Button>)
      expect(screen.getByRole('button', { name: 'Danger' })).toHaveClass('btn-danger')
    })

    it('applies outline variant', () => {
      render(<Button variant="outline">Outline</Button>)
      expect(screen.getByRole('button', { name: 'Outline' })).toHaveClass('btn-outline')
    })

    it('applies ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      expect(screen.getByRole('button', { name: 'Ghost' })).toHaveClass('btn-ghost')
    })

    it('applies sm size', () => {
      render(<Button size="sm">Small</Button>)
      expect(screen.getByRole('button', { name: 'Small' })).toHaveClass('px-3')
    })

    it('applies md size', () => {
      render(<Button size="md">Medium</Button>)
      expect(screen.getByRole('button', { name: 'Medium' })).toHaveClass('px-5')
    })

    it('applies lg size', () => {
      render(<Button size="lg">Large</Button>)
      expect(screen.getByRole('button', { name: 'Large' })).toHaveClass('px-7')
    })

    it('applies icon size', () => {
      render(<Button size="icon">Icon</Button>)
      expect(screen.getByRole('button', { name: 'Icon' })).toHaveClass('p-2.5')
    })

    it('shows loading spinner when loading', () => {
      render(<Button loading>Loading</Button>)
      expect(screen.getByRole('button', { name: 'Loading' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Loading' }).querySelector('svg')).toBeInTheDocument()
    })

    it('disables button when disabled', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled()
    })

    it('calls onClick handler', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click</Button>)
      fireEvent.click(screen.getByRole('button', { name: 'Click' }))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', () => {
      const handleClick = vi.fn()
      render(<Button disabled onClick={handleClick}>Click</Button>)
      fireEvent.click(screen.getByRole('button', { name: 'Click' }))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('forwards ref', () => {
      const ref = vi.fn()
      render(<Button ref={ref}>Ref Button</Button>)
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement))
    })
  })

  describe('Badge', () => {
    it('renders children', () => {
      render(<Badge>Badge Text</Badge>)
      expect(screen.getByText('Badge Text')).toBeInTheDocument()
    })

    it('applies variant classes', () => {
      expect(render(<Badge variant="neutral">Default</Badge>).container.firstChild).toHaveClass('badge-neutral')
      expect(render(<Badge variant="success">Success</Badge>).container.firstChild).toHaveClass('badge-success')
      expect(render(<Badge variant="warning">Warning</Badge>).container.firstChild).toHaveClass('badge-warning')
      expect(render(<Badge variant="danger">Danger</Badge>).container.firstChild).toHaveClass('badge-danger')
      expect(render(<Badge variant="info">Info</Badge>).container.firstChild).toHaveClass('badge-primary')
      expect(render(<Badge variant="primary">Primary</Badge>).container.firstChild).toHaveClass('badge-primary')
    })

    it('applies custom className', () => {
      render(<Badge className="custom-class">Custom</Badge>)
      expect(screen.getByText('Custom')).toHaveClass('custom-class')
    })
  })

  describe('Input', () => {
    it('renders label', () => {
      render(<Input label="Email" />)
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('renders input with placeholder', () => {
      render(<Input placeholder="Enter email" />)
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
    })

    it('shows error message', () => {
      render(<Input label="Email" error="Invalid email" />)
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email')
      expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    })

    it('applies error styles', () => {
      render(<Input label="Email" error="Invalid" />)
      expect(screen.getByLabelText('Email')).toHaveClass('border-[rgb(var(--accent-danger))]')
    })

    it('forwards ref', () => {
      const ref = vi.fn()
      render(<Input ref={ref} />)
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
    })

    it('passes through props', () => {
      render(<Input label="Password" type="password" value="secret" readOnly />)
      const input = screen.getByLabelText('Password')
      expect(input).toHaveAttribute('type', 'password')
      expect(input).toHaveAttribute('readonly', '')
    })
  })

  describe('Select', () => {
    const options = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ]

    it('renders label', () => {
      render(<Select label="Choose" options={options} />)
      expect(screen.getByLabelText('Choose')).toBeInTheDocument()
    })

    it('renders options', () => {
      render(<Select options={options} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument()
    })

    it('shows placeholder', () => {
      render(<Select options={options} placeholder="Select..." />)
      expect(screen.getByRole('option', { name: 'Select...' })).toBeInTheDocument()
    })

    it('shows error message', () => {
      render(<Select label="Choose" options={options} error="Required" />)
      expect(screen.getByRole('alert')).toHaveTextContent('Required')
      expect(screen.getByLabelText('Choose')).toHaveAttribute('aria-invalid', 'true')
    })

    it('forwards ref', () => {
      const ref = vi.fn()
      render(<Select ref={ref} options={options} />)
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLSelectElement))
    })
  })

  describe('Card', () => {
    it('renders children', () => {
      render(<Card>Card Content</Card>)
      expect(screen.getByText('Card Content')).toBeInTheDocument()
    })

    it('applies card class', () => {
      expect(render(<Card>Card</Card>).container.firstChild).toHaveClass('card')
    })
  })

  describe('CardHeader', () => {
    it('renders children', () => {
      render(<CardHeader>Header Content</CardHeader>)
      expect(screen.getByText('Header Content')).toBeInTheDocument()
    })
  })

  describe('CardBody', () => {
    it('renders children', () => {
      render(<CardBody>Body Content</CardBody>)
      expect(screen.getByText('Body Content')).toBeInTheDocument()
    })
  })

  describe('CardFooter', () => {
    it('renders children', () => {
      render(<CardFooter>Footer Content</CardFooter>)
      expect(screen.getByText('Footer Content')).toBeInTheDocument()
    })
  })

  describe('Spinner', () => {
    it('renders spinner', () => {
      const { container } = render(<Spinner />)
      expect(container.firstChild).toBeInTheDocument()
      expect(container.firstChild).toHaveClass('animate-spin')
    })

    it('applies size classes', () => {
      expect(render(<Spinner size="sm" />).container.firstChild).toHaveClass('w-4')
      expect(render(<Spinner size="md" />).container.firstChild).toHaveClass('w-8')
      expect(render(<Spinner size="lg" />).container.firstChild).toHaveClass('w-12')
    })

    it('applies custom className', () => {
      const { container } = render(<Spinner className="custom-spin" />)
      expect(container.firstChild).toHaveClass('custom-spin')
    })
  })

  describe('Skeleton', () => {
    it('renders skeleton', () => {
      const { container } = render(<Skeleton />)
      expect(container.firstChild).toBeInTheDocument()
      expect(container.firstChild).toHaveClass('animate-pulse')
    })

    it('applies custom className', () => {
      const { container } = render(<Skeleton className="custom-skeleton" />)
      expect(container.firstChild).toHaveClass('custom-skeleton')
    })
  })
})