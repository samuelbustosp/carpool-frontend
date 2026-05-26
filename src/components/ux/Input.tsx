import React, { forwardRef, useState } from "react"
import { Eye, EyeOff, Calendar } from "lucide-react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, type, rightIcon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === "password"
    const isYear = type === "year"
    const isDate = type === "date"

    const hasRightPadding =
      isPassword || isYear || (rightIcon && !isDate)

    return (
      <div className="flex flex-col relative">
        {label && (
          <label className="mb-1 text-dark-4 dark:text-gray-1 font-medium text-sm">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={isPassword && showPassword ? "text" : isYear ? "text" : type}
            maxLength={isYear ? 4 : undefined} // solo 4 caracteres para year
            inputMode={isYear ? "numeric" : undefined} // teclado numérico en móviles
            pattern={isYear ? "\\d{4}" : undefined} // valida 4 dígitos
            disabled={props.disabled}
            className={`w-full rounded-md px-3 py-2 
              ${hasRightPadding ? "pr-10" : "pr-3"}
              ${error ? "border-red-500" : ""}
              ${props.disabled
                ? "bg-gray-100 dark:bg-gray-7 dark:text-gray-11 cursor-not-allowed"
                : "border border-gray-300 dark:bg-dark-5 dark:border-gray-2 dark:placeholder-gray-400 dark:text-white"}
              ${className ?? ""}
            `}
            {...props}
          />
          {/* Toggle password */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-11 cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}

          {/* Icono derecho */}
          {!isPassword && (rightIcon || isYear) && (
            <div className="absolute inset-y-0 right-3 flex items-center text-gray-11">
              {isYear ? <Calendar size={18} /> : rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    )
  }
)

Input.displayName = "Input"
