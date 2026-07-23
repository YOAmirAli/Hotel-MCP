import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

export function Card({ title, description, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-outline-variant/20 shadow-sm p-6 ${className}`}
      {...props}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-on-surface">{title}</h3>}
          {description && <p className="text-sm text-on-surface-variant mt-1">{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

export default Card
