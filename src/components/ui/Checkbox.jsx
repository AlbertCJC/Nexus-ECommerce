export function Checkbox({ checked, onChange, disabled, value, className = '', ...props }) {
  return (
    <label className="inline-flex items-center min-h-[44px] min-w-[44px] cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        value={value}
        className={`w-5 h-5 text-[rgb(var(--accent-primary))] border-[rgb(var(--border-subtle))] rounded focus:ring-2 focus:ring-[rgb(var(--accent-primary))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-base))] ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        {...props}
      />
      <span className="sr-only">{props['aria-label'] || 'Checkbox'}</span>
    </label>
  )
}

export default Checkbox