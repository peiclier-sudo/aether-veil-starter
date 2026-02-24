import type { HTMLAttributes } from 'react'

type DivProps = HTMLAttributes<HTMLDivElement>

export function Card({ className = '', ...props }: DivProps) {
  return <div className={`rounded-xl border bg-black/40 ${className}`.trim()} {...props} />
}

export function CardContent({ className = '', ...props }: DivProps) {
  return <div className={className} {...props} />
}
