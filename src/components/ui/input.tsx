import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className = '', ...props }: InputProps) {
  return <input className={`h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400/40 ${className}`.trim()} {...props} />
}
