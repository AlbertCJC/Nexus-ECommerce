import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, className = '', id, ...props }, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <input ref={ref} id={inputId} className={`w-full px-3 py-2 border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'} ${className}`} {...props} aria-invalid={error ? 'true' : 'false'} aria-describedby={error ? `${inputId}-error` : undefined} />
      {error && <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600" role="alert">{error}</p>}
    </div>
  )
})
Input.displayName = 'Input'
export default Input