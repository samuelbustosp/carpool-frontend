import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'google' | 'outline'
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className,
  disabled,
  ...props
}) => {
  const baseClasses =
    'px-4 py-2 rounded-md font-regular'

  const variants = {
    primary:
      'bg-dark-2 text-white hover:bg-dark-3 dark:bg-gray-1 dark:text-dark-1 dark:hover:bg-gray-4 cursor-pointer',
    google: 'bg-gray-1/25 border border-gray-4/50 dark:bg-gray-1 dark:text-dark-1 dark:hover:bg-gray-4 cursor-pointer',
    secondary:
      'bg-blue-800 text-white hover:bg-blue-700 focus:ring-blue-700 cursor-pointer',
    danger:
      'bg-red-800 text-white hover:bg-red-700 cursor-pointer',
    outline:
      'bg-transparent border border-gray-9 text-gray-2 hover:bg-gray-1 dark:border-gray-9 dark:text-white dark:hover:bg-gray-8 focus:ring-gray-400 cursor-pointer',
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className ?? ''} ${
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      }`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
