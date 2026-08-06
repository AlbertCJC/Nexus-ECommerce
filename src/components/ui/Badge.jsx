export function Badge({ children, variant = 'neutral', className = '' }) {
  const variants = {
    neutral: 'badge-neutral',
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-primary'
  }
  return <span className={`badge ${variants[variant]} ${className}`}>{children}</span>
}