import { forwardRef } from 'react'

const Select = forwardRef(({ label, options = [], error, className = '', id, placeholder, ...props }, ref) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="w-full">
      {label && <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <select ref={ref} id={selectId} className={`w-full px-3 py-2 border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'} ${className}`} {...props} aria-invalid={error ? 'true' : 'false'}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <p id={`${selectId}-error`} className="mt-1 text-sm text-red-600" role="alert">{error}</p>}
    </div>
  )
})
Select.displayName = 'Select'
export default Select