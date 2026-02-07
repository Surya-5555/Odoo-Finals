import * as React from 'react'

import { cn } from '@/lib/utils'

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
  onCheckedChange?: (checked: boolean) => void
}

export function Checkbox({ className, onCheckedChange, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cn(
        'size-4 rounded border border-border bg-background accent-primary focus:outline-none focus:ring-2 focus:ring-primary/40',
        className,
      )}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  )
}
