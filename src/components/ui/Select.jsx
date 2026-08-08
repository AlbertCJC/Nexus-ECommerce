import { forwardRef } from 'react'

const Select = forwardRef(({ label, options = [], error, className = '', id, placeholder, ...props }, ref) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="w-full">
      {label && <label htmlFor={selectId} className="label">{label}</label>}
      <select ref={ref} id={selectId} className={`select min-h-[44px] ${error ? 'border-[rgb(var(--accent-danger))] focus:ring-[rgb(var(--accent-danger))]' : ''} ${className}`} {...props} aria-invalid={error ? 'true' : 'false'}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <p id={`${selectId}-error`} className="mt-1.5 text-sm text-[rgb(var(--accent-danger))]" role="alert">{error}</p>}
    </div>
  )
})
Select.displayName = 'Select'
export default Select