import { Badge } from '@/components/ui/badge'
import type { InvoiceState, SubscriptionState } from '@/pages/app/types'

export function formatDate(v: string | null | undefined) {
	if (!v) return '—'
	const d = new Date(v)
	if (Number.isNaN(d.getTime())) return '—'
	return d.toLocaleDateString()
}

export function formatMoney(v: number | null | undefined) {
	if (v == null) return '—'
	return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v)
}

export function SubscriptionStateBadge({ state }: { state: SubscriptionState }) {
	const variant =
		state === 'CONFIRMED'
			? 'success'
			: state === 'QUOTATION_SENT'
				? 'warning'
				: state === 'CLOSED' || state === 'CHURNED'
					? 'danger'
					: state === 'PAUSED'
						? 'muted'
						: 'muted'
	return <Badge variant={variant as any}>{state.replace('_', ' ')}</Badge>
}

export function InvoiceStateBadge({ state }: { state: InvoiceState }) {
	const variant = state === 'PAID' ? 'success' : state === 'CONFIRMED' ? 'warning' : state === 'CANCELLED' ? 'danger' : 'muted'
	return <Badge variant={variant as any}>{state}</Badge>
}
