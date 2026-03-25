import * as React from 'react'
import { Link } from 'react-router-dom'

import { api } from '@/lib/api'
import type { ListResponse, Subscription } from '@/pages/app/types'
import { PageHeader } from '@/components/odoo/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { formatMoney } from '@/pages/app/ui'

function sumSubscriptionTotal(sub: Subscription) {
	const lines = sub.lines ?? []
	return lines.reduce((acc, l) => acc + (Number(l.amount) || 0), 0)
}

function fmtDate(iso?: string | null) {
	if (!iso) return '—'
	const d = new Date(iso)
	if (Number.isNaN(d.getTime())) return '—'
	return d.toLocaleDateString()
}

export function PortalOrdersPage() {
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)
	const [data, setData] = React.useState<Subscription[]>([])

	React.useEffect(() => {
		let cancelled = false
		async function load() {
			setLoading(true)
			setError(null)
			try {
				const res = await api.get<ListResponse<Subscription>>('/subscriptions', { take: 50 })
				if (cancelled) return
				setData(res.data)
			} catch (e: any) {
				setError(e?.message ?? 'Failed to load')
			} finally {
				setLoading(false)
			}
		}
		void load()
		return () => {
			cancelled = true
		}
	}, [])

	return (
		<div className="space-y-4">
			<PageHeader title="My Orders" subtitle="All orders created from the portal checkout." />
			{loading ? <div className="text-sm text-muted-foreground">Loading…</div> : null}
			{error ? <div className="text-sm text-destructive">{error}</div> : null}

			<Card>
				<CardContent className="p-0">
					<Table>
						<THead>
							<TR>
								<TH>Order</TH>
								<TH>Order Date</TH>
								<TH>Status</TH>
								<TH className="text-right">Total</TH>
							</TR>
						</THead>
						<TBody>
							{data.length ? (
								data.map((s) => (
									<TR key={s.id}>
										<TD className="font-medium">
											<Link to={`/portal/orders/${s.id}`} className="hover:underline">
												{s.number}
											</Link>
										</TD>
										<TD>{fmtDate(s.orderDate ?? s.createdAt)}</TD>
										<TD>{s.state}</TD>
										<TD className="text-right">{formatMoney(sumSubscriptionTotal(s))}</TD>
									</TR>
								))
							) : (
								<TR>
									<TD colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
										No orders yet.
									</TD>
								</TR>
							)}
						</TBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}
