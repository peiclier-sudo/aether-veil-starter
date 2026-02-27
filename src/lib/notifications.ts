import { create } from 'zustand'

export interface Toast {
  id: string
  type: 'reward' | 'achievement' | 'levelup' | 'info' | 'warning' | 'error'
  title: string
  message?: string
  icon?: string
  duration?: number
}

interface NotificationState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

let toastCounter = 0

export const useNotifications = create<NotificationState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${++toastCounter}-${Date.now()}`
    const duration = toast.duration || 3000
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }].slice(-5) }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, duration)
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
