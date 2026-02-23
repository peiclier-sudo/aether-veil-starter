import type { HTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

export function Select({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function SelectTrigger({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`hidden ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span>{placeholder}</span>
}

export function SelectContent({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function SelectItem({ children }: { value: string; children: ReactNode }) {
  return <>{children}</>
}

export function NativeSelect({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`h-10 rounded-md border bg-black/70 px-3 text-sm ${className}`.trim()} {...props} />
}
