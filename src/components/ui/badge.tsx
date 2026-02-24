import type { HTMLAttributes } from 'react'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary'
}

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  const variantClass =
    variant === 'secondary'
      ? 'border-zinc-500 bg-zinc-800/70 text-zinc-100'
      : 'border-yellow-500/40 bg-yellow-500/10 text-yellow-200'

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${variantClass} ${className}`.trim()}
      {...props}
    />
  )
}
