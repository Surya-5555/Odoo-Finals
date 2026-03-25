import * as React from 'react'

import { cn } from '@/lib/utils'

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
	return (
		<div className="w-full overflow-auto rounded-2xl border border-border/80">
			<table className={cn('w-full text-left text-sm', className)} {...props} />
		</div>
	)
}

export function THead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
	return <thead className={cn('bg-muted/20 text-muted-foreground', className)} {...props} />
}

export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
	return <th className={cn('px-4 py-3 font-medium', className)} {...props} />
}

export function TBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
	return <tbody className={cn('divide-y divide-border/60', className)} {...props} />
}

export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
	return <tr className={cn('hover:bg-muted/10 transition-colors', className)} {...props} />
}

export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
	return <td className={cn('px-4 py-3 align-middle', className)} {...props} />
}
