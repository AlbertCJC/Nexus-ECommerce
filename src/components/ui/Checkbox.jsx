export function Checkbox({ checked, onChange, disabled, value, className = '', ...props }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      value={value}
      className={`w-4 h-4 text-[rgb(var(--accent-primary))] border-[rgb(var(--border-subtle))] rounded focus:ring-2 focus:ring-[rgb(var(--accent-primary))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-base))] ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    />
  )
}

export default Checkbox