import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Printer } from 'lucide-react'

import { api } from '@/lib/api'
import type { Invoice, ListResponse, Subscription, SubscriptionLine } from '@/pages/app/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMoney } from '@/pages/app/ui'

function sumTotal(lines: SubscriptionLine[]) {
	return (lines ?? []).reduce((acc, l) => acc + (Number(l.amount) || 0), 0)
}

function fmtDate(iso?: string | null) {
	if (!iso) return '—'
	const d = new Date(iso)
	if (Number.isNaN(d.getTime())) return '—'
	return d.toLocaleDateString()
}

export function PortalOrderDetailPage() {
	const params = useParams()
	const navigate = useNavigate()
	const id = Number(params.id)

	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)
	const [actionBusy, setActionBusy] = React.useState(false)
	const [actionError, setActionError] = React.useState<string | null>(null)
	const [actionSuccess, setActionSuccess] = React.useState<string | null>(null)
	const [order, setOrder] = React.useState<Subscription | null>(null)
	const [invoices, setInvoices] = React.useState<Invoice[]>([])

	const load = React.useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const sub = await api.get<Subscription>(`/subscriptions/${id}`)
			setOrder(sub)
			const inv = await api.get<ListResponse<Invoice>>('/invoices', { subscriptionId: id, take: 10 })
			setInvoices(inv.data)
		} catch (e: any) {
			setError(e?.message ?? 'Failed to load')
		} finally {
			setLoading(false)
		}
	}, [id])

	React.useEffect(() => {
		if (!Number.isFinite(id)) return
		let cancelled = false
		async function load() {
			setLoading(true)
			setError(null)
			try {
				const sub = await api.get<Subscription>(`/subscriptions/${id}`)
				if (cancelled) return
				setOrder(sub)
				const inv = await api.get<ListResponse<Invoice>>('/invoices', { subscriptionId: id, take: 10 })
				if (cancelled) return
				setInvoices(inv.data)
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
	}, [id])

	async function runOrderAction(label: string, fn: () => Promise<any>) {
		setActionBusy(true)
		setActionError(null)
		setActionSuccess(null)
		try {
			await fn()
			setActionSuccess(label)
			await load()
		} catch (e: any) {
			setActionError(e?.message ?? 'Action failed')
		} finally {
			setActionBusy(false)
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<Link to="/portal/orders">
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40">
							<ArrowLeft className="mr-2 size-4" />
							Back
						</Button>
					</Link>
					<div>
						<div className="text-2xl font-semibold tracking-tight">Order</div>
						<div className="mt-1 text-sm text-muted-foreground">Details, invoices and actions.</div>
					</div>
				</div>
				<div className="flex flex-wrap gap-2">
					{order?.id ? (
						<Button
							disabled={actionBusy}
							onClick={() =>
								void runOrderAction('Invoice created', () => api.post(`/subscriptions/${order.id}/invoices`, {}))
							}
						>
							Create invoice
						</Button>
					) : null}
					{order?.state === 'DRAFT' || order?.state === 'QUOTATION_SENT' ? (
						<Button
							className="bg-muted/30 text-foreground hover:bg-muted/40"
							disabled={actionBusy}
							onClick={() => void runOrderAction('Order confirmed', () => api.post(`/subscriptions/${id}/confirm`, {}))}
						>
							Confirm
						</Button>
					) : null}
					{order?.state === 'CONFIRMED' ? (
						<>
							<Button
								className="bg-muted/30 text-foreground hover:bg-muted/40"
								disabled={actionBusy}
								onClick={() => void runOrderAction('Order renewed', () => api.post(`/subscriptions/${id}/renew`, {}))}
							>
								Renew
							</Button>
							<Button
								className="bg-muted/30 text-foreground hover:bg-muted/40"
								disabled={actionBusy}
								onClick={() => void runOrderAction('Order paused', () => api.post(`/subscriptions/${id}/pause`, {}))}
							>
								Pause
							</Button>
							<Button
								className="bg-muted/30 text-foreground hover:bg-muted/40"
								disabled={actionBusy}
								onClick={() => void runOrderAction('Order closed', () => api.post(`/subscriptions/${id}/close`, {}))}
							>
								Close
							</Button>
						</>
					) : null}
					{order?.state === 'PAUSED' ? (
						<>
							<Button
								className="bg-muted/30 text-foreground hover:bg-muted/40"
								disabled={actionBusy}
								onClick={() => void runOrderAction('Order resumed', () => api.post(`/subscriptions/${id}/resume`, {}))}
							>
								Resume
							</Button>
							<Button
								className="bg-muted/30 text-foreground hover:bg-muted/40"
								disabled={actionBusy}
								onClick={() => void runOrderAction('Order closed', () => api.post(`/subscriptions/${id}/close`, {}))}
							>
								Close
							</Button>
						</>
					) : null}
					<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => window.print()}>
						<Printer className="mr-2 size-4" />
						Print
					</Button>
				</div>
			</div>

			{loading ? <div className="text-sm text-muted-foreground">Loading…</div> : null}
			{error ? <div className="text-sm text-destructive">{error}</div> : null}
			{actionError ? <div className="text-sm text-destructive">{actionError}</div> : null}
			{actionSuccess ? <div className="text-sm text-emerald-700">{actionSuccess}</div> : null}

			{order ? (
				<div className="grid gap-4 lg:grid-cols-3">
					<Card className="lg:col-span-2">
						<CardHeader>
							<CardTitle>{order.number}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 md:grid-cols-3">
								<div>
									<div className="text-xs text-muted-foreground">Order date</div>
									<div className="text-sm font-medium">{fmtDate(order.orderDate ?? order.createdAt)}</div>
								</div>
								<div>
									<div className="text-xs text-muted-foreground">Status</div>
									<div className="text-sm font-medium">{order.state}</div>
								</div>
								<div>
									<div className="text-xs text-muted-foreground">Total</div>
									<div className="text-sm font-medium">{formatMoney(sumTotal(order.lines ?? []))}</div>
								</div>
							</div>

							<div className="rounded-xl border border-border/60 bg-muted/10 p-3">
								<div className="text-sm font-medium">Products</div>
								<div className="mt-2 space-y-2">
									{order.lines?.length ? (
										order.lines.map((l) => (
											<div key={l.id} className="flex items-center justify-between gap-3 text-sm">
												<div className="min-w-0">
													<div className="truncate font-medium">{l.product?.name ?? 'Product'}</div>
													<div className="text-xs text-muted-foreground">Qty {l.quantity} • {formatMoney(l.unitPrice)}</div>
												</div>
												<div className="font-medium">{formatMoney(l.amount)}</div>
											</div>
										))
									) : (
										<div className="text-sm text-muted-foreground">No lines</div>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Invoices</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{invoices.length ? (
								invoices.map((inv) => (
									<div key={inv.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/10 p-3">
										<div>
											<div className="text-sm font-medium">{inv.number}</div>
											<div className="text-xs text-muted-foreground">{inv.state} • {fmtDate(inv.invoiceDate)}</div>
										</div>
										<div className="flex gap-2">
											<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => navigate(`/portal/invoices/${inv.id}`)}>
												View
											</Button>
											<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => window.open(`/portal/invoices/${inv.id}`, '_blank')}>
												<Download className="mr-2 size-4" />
												Open
											</Button>
										</div>
									</div>
								))
							) : (
								<div className="text-sm text-muted-foreground">No invoices yet.</div>
							)}
						</CardContent>
					</Card>
				</div>
			) : null}
		</div>
	)
}
