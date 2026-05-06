import { AlertCircle, CheckCircle, Info, Loader2, X } from "lucide-react"
import { ReactNode } from "react"
import { createPortal } from "react-dom"

type AlertDialogProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  type?: "error" | "success" | "info"
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  children?: ReactNode
  secondaryButton?: { text: string; onClick: () => void }
  singleButton?: boolean
  loading?: boolean
  autoCloseOnConfirm?: boolean
}

export function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  type = "error",
  title = "¿Estás seguro?",
  description = "Esta acción no se puede deshacer.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  children,
  secondaryButton,
  singleButton = false,
  loading = false,
  autoCloseOnConfirm = true,
}: AlertDialogProps) {
  if (!isOpen) return null

  const iconMap = {
    error:   <AlertCircle size={16} className="text-red-400/80" />,
    success: <CheckCircle size={16} className="text-emerald-400/80" />,
    info:    <Info        size={16} className="text-gray-9" />,
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#111] border border-gray-2/50 rounded-xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-2/50">
          <div className="flex items-center gap-2">
            {iconMap[type]}
            <p className="text-base font-medium text-white/80">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 cursor-pointer flex items-center justify-center rounded-full hover:bg-gray-2/60 transition-colors"
          >
            <X size={14} className="text-white/40" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-3">
          <p className="text-sm text-gray-11 leading-relaxed">{description}</p>
          {children && <div>{children}</div>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-2/50">
          {!singleButton && (
            <button
              onClick={secondaryButton ? secondaryButton.onClick : onClose}
              className="px-4 py-2 cursor-pointer rounded-lg text-sm text-gray-9 hover:text-gray-11 hover:bg-gray-2/20 border border-gray-2/50 transition-colors"
            >
              {secondaryButton ? secondaryButton.text : cancelText}
            </button>
          )}

          <button
            onClick={() => {
              onConfirm?.()
              if (autoCloseOnConfirm) onClose()
            }}
            disabled={loading}
            className="px-4 py-2 cursor-pointer rounded-lg text-sm bg-white text-black font-medium hover:bg-white/85 transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-w-22.5 flex items-center justify-center"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}