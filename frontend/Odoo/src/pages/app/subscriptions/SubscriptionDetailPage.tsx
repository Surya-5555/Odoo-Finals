import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FileText, Pencil, Repeat2, Send, BadgeCheck, Pause, Play, XCircle, ReceiptText } from 'lucide-react'

import { api } from '@/lib/api'
import type { Invoice, ListResponse, Subscription } from '@/pages/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { formatDate, formatMoney, InvoiceStateBadge, SubscriptionStateBadge } from '@/pages/app/ui'

export function SubscriptionDetailPage() {
	const params = useParams()
	const id = Number(params.id)
	const navigate = useNavigate()

	const [sub, setSub] = React.useState<Subscription | null>(null)
	const [invoices, setInvoices] = React.useState<Invoice[]>([])
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)

	async function load() {
		setLoading(true)
		setError(null)
		try {
			const s = await api.get<Subscription>(`/subscriptions/${id}`)
			const inv = await api.get<ListResponse<Invoice>>('/invoices', { subscriptionId: id })
			setSub(s)
			setInvoices(inv.data)
		} catch (e: any) {
			setError(e?.message ?? 'Failed to load')
		} finally {
			setLoading(false)
		}
	}

	React.useEffect(() => {
		if (!Number.isFinite(id)) return
		void load()
	}, [id])

	async function act(path: string, label: string) {
		try {
			await api.post(`/subscriptions/${id}/${path}`)
			await load()
		} catch (e: any) {
			alert(`${label} failed: ${e?.message ?? 'Unknown error'}`)
		}
	}

	async function createInvoice() {
		try {
			const created = await api.post<{ id: number }>(`/subscriptions/${id}/invoices`)
			await load()
			if (created?.id) navigate(`/app/invoices/${created.id}`)
		} catch (e: any) {
			alert(e?.message ?? 'Create invoice failed')
		}
	}

	if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>
	if (error) return <div className="text-sm text-red-300">{error}</div>
	if (!sub) return <div className="text-sm text-muted-foreground">Not found.</div>

	const isDraft = sub.state === 'DRAFT'
	const isQuotation = sub.state === 'QUOTATION_SENT'
	const isConfirmed = sub.state === 'CONFIRMED'
	const isPaused = sub.state === 'PAUSED'

	const total = sub.lines?.reduce((sum, l) => sum + (l.amount ?? 0), 0) ?? 0

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<Link to="/app/subscriptions">
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40">
							<ArrowLeft className="mr-2 size-4" />
							Back
						</Button>
					</Link>
					<div>
						<div className="flex items-center gap-2">
							<div className="text-2xl font-semibold tracking-tight">{sub.number}</div>
							<SubscriptionStateBadge state={sub.state} />
						</div>
						<div className="mt-1 text-sm text-muted-foreground">{sub.contact?.name} • {sub.recurringPlan?.name}</div>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Link to={`/app/subscriptions/${sub.id}/edit`}>
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40">
							<Pencil className="mr-2 size-4" />
							Edit
						</Button>
					</Link>

					{(isDraft || isQuotation) ? (
						<Button onClick={() => act('send', 'Send')} className="bg-muted/30 text-foreground hover:bg-muted/40" disabled={!isDraft}>
							<Send className="mr-2 size-4" />
							Send
						</Button>
					) : null}

					{(isDraft || isQuotation) ? (
						<Button onClick={() => act('confirm', 'Confirm')}>
							<BadgeCheck className="mr-2 size-4" />
							Confirm
						</Button>
					) : null}

					{isConfirmed || isPaused ? (
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={createInvoice}>
							<ReceiptText className="mr-2 size-4" />
							Create Invoice
						</Button>
					) : null}

					{isConfirmed || isPaused ? (
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => act('renew', 'Renew')}>
							<Repeat2 className="mr-2 size-4" />
							Renew
						</Button>
					) : null}

					{isConfirmed ? (
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => act('pause', 'Pause')}>
							<Pause className="mr-2 size-4" />
							Pause
						</Button>
					) : null}
					{isPaused ? (
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => act('resume', 'Resume')}>
							<Play className="mr-2 size-4" />
							Resume
						</Button>
					) : null}

					{(isConfirmed || isPaused) ? (
						<Button className="bg-destructive hover:brightness-110" onClick={() => act('close', 'Close')}>
							<XCircle className="mr-2 size-4" />
							Close
						</Button>
					) : null}
				</div>
			</div>

			<div className="grid gap-4 xl:grid-cols-3">
				<Card className="xl:col-span-2">
					<CardHeader>
						<CardTitle>Lines</CardTitle>
					</CardHeader>
					<CardContent>
						{sub.lines?.length ? (
							<Table>
								<THead>
									<TR>
										<TH>Product</TH>
										<TH>Qty</TH>
										<TH>Unit</TH>
										<TH>Disc</TH>
										<TH>Tax</TH>
										<TH className="text-right">Amount</TH>
									</TR>
								</THead>
								<TBody>
									{sub.lines.map((l) => (
										<TR key={l.id}>
											<TD className="font-medium">{l.product?.name ?? l.productId}</TD>
											<TD className="text-muted-foreground">{l.quantity}</TD>
											<TD className="text-muted-foreground">{formatMoney(l.unitPrice)}</TD>
											<TD className="text-muted-foreground">{l.discountPercent ?? 0}%</TD>
											<TD className="text-muted-foreground">{l.taxPercent ?? 0}%</TD>
											<TD className="text-right">{formatMoney(l.amount)}</TD>
										</TR>
									))}
								</TBody>
							</Table>
						) : (
							<div className="text-sm text-muted-foreground">No lines.</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Summary</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Order date</span>
							<span>{formatDate(sub.orderDate)}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Start date</span>
							<span>{formatDate(sub.startDate)}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Next invoice</span>
							<span>{formatDate(sub.nextInvoiceDate)}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Expiration</span>
							<span>{formatDate(sub.expirationDate)}</span>
						</div>
						<div className="mt-2 flex items-center justify-between border-t border-border/60 pt-3">
							<span className="text-muted-foreground">Total</span>
							<span className="text-base font-semibold">{formatMoney(total)}</span>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Invoices</CardTitle>
				</CardHeader>
				<CardContent>
					{invoices.length ? (
						<Table>
							<THead>
								<TR>
									<TH>Number</TH>
									<TH>Invoice date</TH>
									<TH>Due</TH>
									<TH>State</TH>
									<TH className="text-right">Open</TH>
								</TR>
							</THead>
							<TBody>
								{invoices.map((i) => (
									<TR key={i.id}>
										<TD className="font-medium">{i.number}</TD>
										<TD className="text-muted-foreground">{formatDate(i.invoiceDate)}</TD>
										<TD className="text-muted-foreground">{formatDate(i.dueDate)}</TD>
										<TD><InvoiceStateBadge state={i.state} /></TD>
										<TD className="text-right">
											<Link to={`/app/invoices/${i.id}`}>
												<Button className="bg-muted/30 text-foreground hover:bg-muted/40">
													<FileText className="mr-2 size-4" />
													Open
												</Button>
											</Link>
										</TD>
									</TR>
								))}
							</TBody>
						</Table>
					) : (
						<div className="text-sm text-muted-foreground">No invoices yet.</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
