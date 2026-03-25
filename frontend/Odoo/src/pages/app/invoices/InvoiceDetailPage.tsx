import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, IndianRupee, X } from 'lucide-react'

import { api } from '@/lib/api'
import type { Invoice, PaymentMethod } from '@/pages/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InvoiceStateBadge, formatDate, formatMoney } from '@/pages/app/ui'

function invoiceTotal(inv: Invoice) {
	if (!inv.lines?.length) return null
	return inv.lines.reduce((sum, l) => sum + Number(l.amount ?? 0), 0)
}

export function InvoiceDetailPage() {
	const params = useParams()
	const id = Number(params.id)
	const navigate = useNavigate()

	const [inv, setInv] = React.useState<Invoice | null>(null)
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)

	const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('ONLINE')
	const [paymentDate, setPaymentDate] = React.useState<string>(() => new Date().toISOString().slice(0, 10))
	const [paying, setPaying] = React.useState(false)

	async function load() {
		setLoading(true)
		setError(null)
		try {
			const i = await api.get<Invoice>(`/invoices/${id}`)
			setInv(i)
			setPaymentMethod((i.paymentMethod as PaymentMethod | null) ?? 'ONLINE')
			setPaymentDate(i.paymentDate ? new Date(i.paymentDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10))
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

	async function confirmInvoice() {
		try {
			await api.post(`/invoices/${id}/confirm`)
			await load()
		} catch (e: any) {
			alert(e?.message ?? 'Confirm failed')
		}
	}

	async function cancelInvoice() {
		if (!confirm('Cancel this invoice?')) return
		try {
			await api.post(`/invoices/${id}/cancel`)
			await load()
		} catch (e: any) {
			alert(e?.message ?? 'Cancel failed')
		}
	}

	async function restoreToDraft() {
		try {
			await api.post(`/invoices/${id}/restore-draft`)
			await load()
		} catch (e: any) {
			alert(e?.message ?? 'Restore failed')
		}
	}

	async function markPaid() {
		setPaying(true)
		try {
			await api.post(`/invoices/${id}/pay`, {
				paymentMethod,
				paymentDate: paymentDate ? new Date(paymentDate).toISOString() : undefined,
			})
			await load()
		} catch (e: any) {
			alert(e?.message ?? 'Pay failed')
		} finally {
			setPaying(false)
		}
	}

	if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>
	if (error) return <div className="text-sm text-red-300">{error}</div>
	if (!inv) return <div className="text-sm text-muted-foreground">Not found.</div>

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<Link to="/app/invoices">
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40">
							<ArrowLeft className="mr-2 size-4" />
							Back
						</Button>
					</Link>
					<div>
						<div className="flex items-center gap-2">
							<div className="text-2xl font-semibold tracking-tight">{inv.number}</div>
							<InvoiceStateBadge state={inv.state} />
						</div>
						<div className="mt-1 text-sm text-muted-foreground">Subscription #{inv.subscriptionId} • Contact #{inv.contactId}</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Link to={`/app/subscriptions/${inv.subscriptionId}`}>
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40">Open Subscription</Button>
					</Link>
					{inv.state === 'DRAFT' ? (
						<>
							<Button onClick={confirmInvoice}>
								<BadgeCheck className="mr-2 size-4" />
								Confirm
							</Button>
							<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={cancelInvoice}>
								<X className="mr-2 size-4" />
								Cancel
							</Button>
						</>
					) : null}
					{inv.state === 'CONFIRMED' ? (
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={cancelInvoice}>
							<X className="mr-2 size-4" />
							Cancel
						</Button>
					) : null}
					{inv.state === 'CANCELLED' ? (
						<Button onClick={restoreToDraft}>
							<BadgeCheck className="mr-2 size-4" />
							Restore to Draft
						</Button>
					) : null}
				</div>
			</div>

			<Card className="max-w-2xl">
				<CardHeader>
					<CardTitle>Invoice info</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm">
					{invoiceTotal(inv) != null ? (
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Amount</span>
							<span className="font-medium">{formatMoney(invoiceTotal(inv)!)}</span>
						</div>
					) : null}
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Invoice date</span>
						<span>{formatDate(inv.invoiceDate)}</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Due date</span>
						<span>{formatDate(inv.dueDate)}</span>
					</div>
					{inv.paymentMethod ? (
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Payment method</span>
							<span>{inv.paymentMethod === 'ONLINE' ? 'Online' : 'Cash'}</span>
						</div>
					) : null}
					{inv.paymentDate ? (
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Payment date</span>
							<span>{formatDate(inv.paymentDate)}</span>
						</div>
					) : null}
				</CardContent>
			</Card>

			{inv.state === 'CONFIRMED' ? (
				<Card className="max-w-2xl">
					<CardHeader>
						<CardTitle>Register payment</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<Label>Payment method</Label>
								<select
									className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm"
									value={paymentMethod}
									onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
								>
									<option value="ONLINE">Online</option>
									<option value="CASH">Cash</option>
								</select>
							</div>
							<div>
								<Label>Payment date</Label>
								<Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
							</div>
						</div>

						<div className="text-xs text-muted-foreground">Payment method/date will be persisted when you register payment.</div>

						<div className="flex flex-wrap gap-2">
							<Button className="bg-emerald-600 hover:brightness-110" onClick={markPaid} disabled={paying}>
								<IndianRupee className="mr-2 size-4" />
								{paying ? 'Saving…' : 'Payment'}
							</Button>
							<Button
								className="bg-muted/30 text-foreground hover:bg-muted/40"
								onClick={() => {
									setPaymentMethod('ONLINE')
									setPaymentDate(new Date().toISOString().slice(0, 10))
									navigate('/app/invoices')
								}}
							>
								<X className="mr-2 size-4" />
								Discard
							</Button>
						</div>
					</CardContent>
				</Card>
			) : null}
		</div>
	)
}
