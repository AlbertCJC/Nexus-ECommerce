import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, className = '', id, ...props }, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <input ref={ref} id={inputId} className={`input ${error ? 'border-[rgb(var(--accent-danger))] focus:ring-[rgb(var(--accent-danger))]' : ''} ${className}`} {...props} aria-invalid={error ? 'true' : 'false'} aria-describedby={error ? `${inputId}-error` : undefined} />
      {error && <p id={`${inputId}-error`} className="mt-1.5 text-sm text-[rgb(var(--accent-danger))]" role="alert">{error}</p>}
    </div>
  )
})
Input.displayName = 'Input'
export default Input