import { useAppContext } from '../../context/AppContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '../../utils/validation'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export function AdminLogin() {
  const { login } = useAppContext()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = (data) => {
    setLoading(true)
    const success = login(data.email, data.password)
    if (success) navigate('/admin/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Login</h1>
          <p className="mt-2 text-slate-500">Enter your credentials to access the dashboard</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input label="Email" type="email" {...register('email')} error={errors.email?.message} placeholder="admin@example.com" />
            <Input label="Password" type="password" {...register('password')} error={errors.password?.message} placeholder="••••••••" />
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> Sign In
            </Button>
          </form>
          <div className="mt-6 p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
            <p className="font-medium text-slate-900">Demo Credentials:</p>
            <p>Email: admin@example.com</p>
            <p>Password: admin123</p>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500"><a href="/" className="text-primary-600 hover:underline">← Back to Store</a></p>
      </div>
    </div>
  )
}