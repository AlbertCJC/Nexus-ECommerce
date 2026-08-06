export function Card({ children, className = '', hover }) {
  return (
    <div className={`card ${hover ? 'transition-smooth' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return <div className={`px-6 py-4 border-b border-[rgb(var(--border-subtle))] ${className}`}>{children}</div>
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-6 ${className}`}>{children}</div>
}

export function CardFooter({ children, className = '' }) {
  return <div className={`px-6 py-4 border-t border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-base))] ${className}`}>{children}</div>
}