import { useNotifications } from '@/lib/notifications'

const typeStyles: Record<string, { bg: string; border: string; icon: string }> = {
  reward: { bg: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-500/40', icon: '💎' },
  achievement: { bg: 'from-purple-500/20 to-pink-500/10', border: 'border-purple-500/40', icon: '🏆' },
  levelup: { bg: 'from-cyan-500/20 to-blue-500/10', border: 'border-cyan-500/40', icon: '⬆️' },
  info: { bg: 'from-blue-500/20 to-sky-500/10', border: 'border-blue-500/40', icon: 'ℹ️' },
  warning: { bg: 'from-orange-500/20 to-amber-500/10', border: 'border-orange-500/40', icon: '⚠️' },
  error: { bg: 'from-red-500/20 to-rose-500/10', border: 'border-red-500/40', icon: '❌' },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useNotifications()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm">
      {toasts.map((toast, i) => {
        const style = typeStyles[toast.type] || typeStyles.info
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-gradient-to-r ${style.bg} backdrop-blur-xl border ${style.border} rounded-xl px-4 py-3 shadow-2xl shadow-black/50 animate-[toast-in_0.35s_ease-out]`}
            style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'backwards' }}
            onClick={() => removeToast(toast.id)}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">{toast.icon || style.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{toast.title}</p>
                {toast.message && (
                  <p className="text-xs text-white/60 mt-0.5">{toast.message}</p>
                )}
              </div>
            </div>
          </div>
        )
      })}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(80px) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
