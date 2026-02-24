import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export function Button({ className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-md border border-yellow-400/40 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-100 transition hover:bg-yellow-500/20 ${className}`.trim()}
      {...props}
    />
  )
}
