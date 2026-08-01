import { generateId } from '../utils/helpers'

export const seedCategories = [
  { id: 'cat-1', name: 'Electronics', description: 'Gadgets, devices, and tech accessories' },
  { id: 'cat-2', name: 'Clothing', description: 'Apparel, footwear, and fashion accessories' },
  { id: 'cat-3', name: 'Books', description: 'Physical books, e-books, and educational materials' },
  { id: 'cat-4', name: 'Home & Garden', description: 'Home improvement, decor, and garden supplies' }
]

export const seedProducts = [
  // Electronics
  { id: 'prod-1', name: 'Wireless Bluetooth Headphones', image: 'https://picsum.photos/seed/prod-1/400/400.jpg', categoryId: 'cat-1', description: 'Premium noise-cancelling headphones with 30-hour battery life.', price: 149.99, stock: 45, status: 'active', createdAt: '2024-01-15T10:00:00Z' },
  { id: 'prod-2', name: 'Smart Watch Series 5', image: 'https://picsum.photos/seed/prod-2/400/400.jpg', categoryId: 'cat-1', description: 'Fitness tracking, heart rate monitoring, and cellular connectivity.', price: 399.99, stock: 20, status: 'active', createdAt: '2024-01-20T10:00:00Z' },
  { id: 'prod-3', name: 'Portable Bluetooth Speaker', image: 'https://picsum.photos/seed/prod-3/400/400.jpg', categoryId: 'cat-1', description: 'Waterproof speaker with 360-degree sound and 12-hour playtime.', price: 79.99, stock: 0, status: 'out_of_stock', createdAt: '2024-02-01T10:00:00Z' },

  // Clothing
  { id: 'prod-4', name: 'Classic Cotton T-Shirt', image: 'https://picsum.photos/seed/prod-4/400/400.jpg', categoryId: 'cat-2', description: '100% organic cotton, pre-shrunk, available in multiple colors.', price: 24.99, stock: 100, status: 'active', createdAt: '2024-01-10T10:00:00Z' },
  { id: 'prod-5', name: 'Slim Fit Denim Jeans', image: 'https://picsum.photos/seed/prod-5/400/400.jpg', categoryId: 'cat-2', description: 'Stretch denim with modern slim fit, classic 5-pocket styling.', price: 59.99, stock: 60, status: 'active', createdAt: '2024-01-25T10:00:00Z' },
  { id: 'prod-6', name: 'Lightweight Hoodie', image: 'https://picsum.photos/seed/prod-6/400/400.jpg', categoryId: 'cat-2', description: 'French terry fabric, relaxed fit, kangaroo pocket.', price: 44.99, stock: 30, status: 'inactive', createdAt: '2024-02-05T10:00:00Z' },

  // Books
  { id: 'prod-7', name: 'The Pragmatic Programmer', image: 'https://picsum.photos/seed/prod-7/400/400.jpg', categoryId: 'cat-3', description: 'Classic guide to software craftsmanship, 20th Anniversary Edition.', price: 42.99, stock: 25, status: 'active', createdAt: '2024-01-05T10:00:00Z' },
  { id: 'prod-8', name: 'Clean Code', image: 'https://picsum.photos/seed/prod-8/400/400.jpg', categoryId: 'cat-3', description: 'A handbook of agile software craftsmanship by Robert C. Martin.', price: 38.99, stock: 15, status: 'active', createdAt: '2024-01-12T10:00:00Z' },
  { id: 'prod-9', name: 'Design Patterns', image: 'https://picsum.photos/seed/prod-9/400/400.jpg', categoryId: 'cat-3', description: 'Elements of reusable object-oriented software (Gang of Four).', price: 49.99, stock: 10, status: 'active', createdAt: '2024-02-10T10:00:00Z' },

  // Home & Garden
  { id: 'prod-10', name: 'Ceramic Plant Pot Set', image: 'https://picsum.photos/seed/prod-10/400/400.jpg', categoryId: 'cat-4', description: 'Set of 3 minimalist ceramic pots with drainage holes.', price: 34.99, stock: 40, status: 'active', createdAt: '2024-01-18T10:00:00Z' },
  { id: 'prod-11', name: 'LED Desk Lamp', image: 'https://picsum.photos/seed/prod-11/400/400.jpg', categoryId: 'cat-4', description: 'Adjustable brightness, color temperature, USB charging port.', price: 54.99, stock: 22, status: 'active', createdAt: '2024-01-28T10:00:00Z' },
  { id: 'prod-12', name: 'Throw Blanket', image: 'https://picsum.photos/seed/prod-12/400/400.jpg', categoryId: 'cat-4', description: 'Ultra-soft microfiber blanket, 50x60 inches, machine washable.', price: 29.99, stock: 50, status: 'active', createdAt: '2024-02-12T10:00:00Z' }
]

export const seedOrders = [
  {
    id: 'ord-1',
    customer: { name: 'John Smith', email: 'john@example.com', phone: '+1-555-0123', address: { street: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'USA' } },
    items: [
      { productId: 'prod-1', name: 'Wireless Bluetooth Headphones', price: 149.99, quantity: 1, image: 'https://picsum.photos/seed/prod-1/400/400.jpg' },
      { productId: 'prod-4', name: 'Classic Cotton T-Shirt', price: 24.99, quantity: 2, image: 'https://picsum.photos/seed/prod-4/400/400.jpg' }
    ],
    subtotal: 199.97,
    shipping: 0,
    tax: 19.99,
    total: 219.96,
    paymentMethod: 'cod',
    status: 'completed',
    notes: 'Leave at door if no answer',
    createdAt: '2024-02-15T14:30:00Z'
  },
  {
    id: 'ord-2',
    customer: { name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1-555-0456', address: { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zip: '90001', country: 'USA' } },
    items: [
      { productId: 'prod-7', name: 'The Pragmatic Programmer', price: 42.99, quantity: 1, image: 'https://picsum.photos/seed/prod-7/400/400.jpg' },
      { productId: 'prod-10', name: 'Ceramic Plant Pot Set', price: 34.99, quantity: 1, image: 'https://picsum.photos/seed/prod-10/400/400.jpg' }
    ],
    subtotal: 77.98,
    shipping: 9.99,
    tax: 7.80,
    total: 95.77,
    paymentMethod: 'ewallet',
    status: 'pending',
    notes: '',
    createdAt: '2024-02-20T09:15:00Z'
  }
]

export const seedCustomers = [
  { id: 'cust-1', name: 'John Smith', email: 'john@example.com', phone: '+1-555-0123', address: { street: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'USA' }, orderCount: 1, totalSpent: 219.96, status: 'active' },
  { id: 'cust-2', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1-555-0456', address: { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zip: '90001', country: 'USA' }, orderCount: 1, totalSpent: 95.77, status: 'active' }
]

export const ADMIN_CREDENTIALS = { email: 'admin@example.com', password: 'admin123' }