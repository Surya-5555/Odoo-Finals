import * as React from 'react'

import { cn } from '@/lib/utils'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'default' | 'lg'
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'h-10 px-4',
  lg: 'h-12 px-6',
}

export function Button({ className, size = 'default', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-colors',
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  )
}
