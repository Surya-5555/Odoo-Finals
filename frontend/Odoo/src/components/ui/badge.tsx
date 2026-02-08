import * as React from 'react'

import { cn } from '@/lib/utils'

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
	variant?: 'default' | 'success' | 'warning' | 'danger' | 'muted'
}

const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
	default: 'bg-primary/15 text-primary border-primary/20',
	success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
	warning: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
	danger: 'bg-red-500/15 text-red-300 border-red-500/20',
	muted: 'bg-muted/40 text-muted-foreground border-border/60',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
	return (
		<span
			className={cn(
				'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium',
				variants[variant],
				className,
			)}
			{...props}
		/>
	)
}
