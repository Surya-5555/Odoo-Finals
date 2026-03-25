import * as React from 'react'

import { cn } from '@/lib/utils'

export type CardProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
	return (
		<div
			className={cn(
				'rounded-2xl border border-border/80 bg-card/30 backdrop-blur-md shadow-[0_1px_0_0_rgba(255,255,255,0.04)]',
				className,
			)}
			{...props}
		/>
	)
}

export function CardHeader({ className, ...props }: CardProps) {
	return <div className={cn('p-5 pb-3', className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('text-base font-semibold tracking-tight', className)} {...props} />
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('text-sm text-muted-foreground', className)} {...props} />
}

export function CardContent({ className, ...props }: CardProps) {
	return <div className={cn('p-5 pt-0', className)} {...props} />
}
