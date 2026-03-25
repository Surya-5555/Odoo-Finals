import * as React from 'react'

import { cn } from '@/lib/utils'

export type PageHeaderProps = {
	title: string
	subtitle?: string
	actions?: React.ReactNode
	children?: React.ReactNode
	className?: string
}

export function PageHeader({ title, subtitle, actions, children, className }: PageHeaderProps) {
	return (
		<div className={cn('mb-4 border-b border-border/80 pb-4', className)}>
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<div className="text-xl font-semibold tracking-tight">{title}</div>
					{subtitle ? <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div> : null}
				</div>
				{actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
			</div>
			{children ? <div className="mt-3 flex flex-wrap items-center gap-2">{children}</div> : null}
		</div>
	)
}
