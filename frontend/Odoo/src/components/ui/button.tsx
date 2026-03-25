import * as React from 'react'

import { cn } from '@/lib/utils'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'default' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'h-10 px-4',
  lg: 'h-12 px-6',
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
	primary: 'bg-primary text-primary-foreground hover:brightness-110',
	secondary: 'bg-muted/40 text-foreground hover:bg-muted/55',
	outline: 'bg-transparent border border-border text-foreground hover:bg-muted/20',
	ghost: 'bg-transparent text-foreground hover:bg-muted/20',
	danger: 'bg-destructive text-destructive-foreground hover:brightness-110',
}

export function Button({ className, size = 'default', variant = 'primary', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  )
}
