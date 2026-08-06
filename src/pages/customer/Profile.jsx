import { useState, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useAppContext } from '../../context/AppContext'
import { z } from 'zod'
import { Spinner } from '../../components/ui/Spinner'

// Profile update validation schema
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(/^[\d\s\-\+\(\)]{10,}$/, 'Invalid phone number').optional().or(z.literal('')),
  address: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zip: z.string().regex(/^\d{4,6}$/, 'Invalid ZIP code (4-6 digits)'),
    country: z.string().min(2, 'Country is required')
  }).optional()
})

export default function Profile() {
  const { user, updateProfile, loading: authLoading } = useAuth()
  const { addToast } = useAppContext()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    phone: user?.phone || '',
    address: user?.address || {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    }
  })
  const [errors, setErrors] = useState({})

  const validateForm = useCallback(() => {
    const result = profileSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors = {}
      result.error.errors.forEach(err => {
        const path = err.path.join('.')
        fieldErrors[path] = err.message
      })
      setErrors(fieldErrors)
      return false
    }
    setErrors({})
    return true
  }, [formData])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('address.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const updates = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        address: formData.address
      }
      await updateProfile(updates)
      addToast({ type: 'success', message: 'Profile updated successfully' })
      setIsEditing(false)
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update profile: ' + err.message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form to current user data
    setFormData({
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      phone: user?.phone || '',
      address: user?.address || {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: ''
      }
    })
    setErrors({})
    setIsEditing(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg-base))] flex items-center justify-center px-4">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-[rgb(var(--text-muted))]">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg-base))] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[rgb(var(--text-primary))]">Please log in to view your profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-base))]">
      <div className="bg-[rgb(var(--bg-card))] border-b border-[rgb(var(--border-subtle))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">Profile</h1>
              <p className="mt-1 text-[rgb(var(--text-muted))]">Manage your account information</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-outline self-start"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {isEditing ? (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="space-y-6">
              {/* Personal Info */}
              <section className="card p-6 space-y-6">
                <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Personal Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="label">First Name</label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      className={`input ${errors.firstName ? 'border-[rgb(var(--accent-danger))]' : ''}`}
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={isSaving}
                    />
                    {errors.firstName && <p className="text-xs text-[rgb(var(--accent-danger))] mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="label">Last Name</label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      className={`input ${errors.lastName ? 'border-[rgb(var(--accent-danger))]' : ''}`}
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={isSaving}
                    />
                    {errors.lastName && <p className="text-xs text-[rgb(var(--accent-danger))] mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="label">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={`input ${errors.phone ? 'border-[rgb(var(--accent-danger))]' : ''}`}
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isSaving}
                    placeholder="+1 (555) 000-0000"
                  />
                  {errors.phone && <p className="text-xs text-[rgb(var(--accent-danger))] mt-1">{errors.phone}</p>}
                </div>
              </section>

              {/* Address */}
              <section className="card p-6 space-y-6">
                <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="street" className="label">Street Address</label>
                    <input
                      id="street"
                      name="address.street"
                      type="text"
                      className={`input ${errors['address.street'] ? 'border-[rgb(var(--accent-danger))]' : ''}`}
                      value={formData.address.street}
                      onChange={handleChange}
                      disabled={isSaving}
                      placeholder="123 Main Street"
                    />
                    {errors['address.street'] && <p className="text-xs text-[rgb(var(--accent-danger))] mt-1">{errors['address.street']}</p>}
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="label">City</label>
                      <input
                        id="city"
                        name="address.city"
                        type="text"
                        className={`input ${errors['address.city'] ? 'border-[rgb(var(--accent-danger))]' : ''}`}
                        value={formData.address.city}
                        onChange={handleChange}
                        disabled={isSaving}
                      />
                      {errors['address.city'] && <p className="text-xs text-[rgb(var(--accent-danger))] mt-1">{errors['address.city']}</p>}
                    </div>
                    <div>
                      <label htmlFor="state" className="label">State/Province</label>
                      <input
                        id="state"
                        name="address.state"
                        type="text"
                        className={`input ${errors['address.state'] ? 'border-[rgb(var(--accent-danger))]' : ''}`}
                        value={formData.address.state}
                        onChange={handleChange}
                        disabled={isSaving}
                      />
                      {errors['address.state'] && <p className="text-xs text-[rgb(var(--accent-danger))] mt-1">{errors['address.state']}</p>}
                    </div>
                    <div>
                      <label htmlFor="zip" className="label">ZIP/Postal Code</label>
                      <input
                        id="zip"
                        name="address.zip"
                        type="text"
                        className={`input ${errors['address.zip'] ? 'border-[rgb(var(--accent-danger))]' : ''}`}
                        value={formData.address.zip}
                        onChange={handleChange}
                        disabled={isSaving}
                      />
                      {errors['address.zip'] && <p className="text-xs text-[rgb(var(--accent-danger))] mt-1">{errors['address.zip']}</p>}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="country" className="label">Country</label>
                    <input
                      id="country"
                      name="address.country"
                      type="text"
                      className={`input ${errors['address.country'] ? 'border-[rgb(var(--accent-danger))]' : ''}`}
                      value={formData.address.country}
                      onChange={handleChange}
                      disabled={isSaving}
                    />
                    {errors['address.country'] && <p className="text-xs text-[rgb(var(--accent-danger))] mt-1">{errors['address.country']}</p>}
                  </div>
                </div>
              </section>

              {/* Actions */}
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-outline"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" />
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Profile Header */}
            <section className="card p-6 text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-white">
                  {user.first_name?.[0] || user.last_name?.[0] || user.email?.[0] || 'U'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-[rgb(var(--text-muted))] mt-1">{user.email}</p>
              {user.updated_at && (
                <p className="text-xs text-[rgb(var(--text-muted))] mt-2">
                  Last updated: {new Date(user.updated_at).toLocaleDateString()}
                </p>
              )}
            </section>

            {/* Personal Info */}
            <section className="card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Personal Information</h3>
              <dl className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-[rgb(var(--text-muted))]">First Name</dt>
                    <dd className="font-medium text-[rgb(var(--text-primary))]">{user.first_name || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-[rgb(var(--text-muted))]">Last Name</dt>
                    <dd className="font-medium text-[rgb(var(--text-primary))]">{user.last_name || '—'}</dd>
                  </div>
                </div>
                <div>
                  <dt className="text-sm text-[rgb(var(--text-muted))]">Phone</dt>
                  <dd className="font-medium text-[rgb(var(--text-primary))]">{user.phone || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-[rgb(var(--text-muted))]">Email</dt>
                  <dd className="font-medium text-[rgb(var(--text-primary))]">{user.email}</dd>
                </div>
              </dl>
            </section>

            {/* Address */}
            {user.address && (user.address.street || user.address.city || user.address.state || user.address.zip || user.address.country) && (
              <section className="card p-6 space-y-4">
                <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Shipping Address</h3>
                <address className="text-[rgb(var(--text-muted))] not-italic space-y-1">
                  <p className="font-medium text-[rgb(var(--text-primary))]">{user.first_name} {user.last_name}</p>
                  {user.address.street && <p>{user.address.street}</p>}
                  {user.address.city && <p>{user.address.city}, {user.address.state} {user.address.zip}</p>}
                  {user.address.country && <p>{user.address.country}</p>}
                  {user.phone && <p className="mt-2"><span className="font-medium">Phone:</span> {user.phone}</p>}
                </address>
              </section>
            )}

            {/* Account Status */}
            <section className="card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Account Status</h3>
              <dl className="grid sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-[rgb(var(--text-muted))]">Member Since</dt>
                  <dd className="font-medium text-[rgb(var(--text-primary))]">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-[rgb(var(--text-muted))]">Orders Placed</dt>
                  <dd className="font-medium text-[rgb(var(--text-primary))]">{user.order_count || 0}</dd>
                </div>
                <div>
                  <dt className="text-sm text-[rgb(var(--text-muted))]">Total Spent</dt>
                  <dd className="font-medium text-[rgb(var(--text-primary))]">
                    {user.total_spent ? `$${(user.total_spent / 100).toFixed(2)}` : '$0.00'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-[rgb(var(--text-muted))]">Status</dt>
                  <dd className="font-medium text-[rgb(var(--text-primary))] capitalize">{user.status || 'active'}</dd>
                </div>
              </dl>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}