import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Printer } from 'lucide-react'

import { api } from '@/lib/api'
import type { Contact, Invoice } from '@/pages/app/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMoney } from '@/pages/app/ui'

function fmtDate(iso?: string | null) {
	if (!iso) return '—'
	const d = new Date(iso)
	if (Number.isNaN(d.getTime())) return '—'
	return d.toLocaleDateString()
}

function sumTotal(inv: Invoice) {
	const lines = inv.lines ?? []
	return lines.reduce((acc, l) => acc + (Number(l.amount) || 0), 0)
}

export function PortalInvoicePage() {
	const params = useParams()
	const id = Number(params.id)

	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)
	const [actionBusy, setActionBusy] = React.useState(false)
	const [actionError, setActionError] = React.useState<string | null>(null)
	const [actionSuccess, setActionSuccess] = React.useState<string | null>(null)
	const [invoice, setInvoice] = React.useState<Invoice | null>(null)
	const [contact, setContact] = React.useState<Contact | null>(null)
	const [paymentMethod, setPaymentMethod] = React.useState<'ONLINE' | 'CASH'>('ONLINE')

	React.useEffect(() => {
		if (!Number.isFinite(id)) return
		let cancelled = false
		async function load() {
			setLoading(true)
			setError(null)
			try {
				const inv = await api.get<Invoice>(`/invoices/${id}`)
				if (cancelled) return
				setInvoice(inv)
				setPaymentMethod((inv.paymentMethod as any) ?? 'ONLINE')
				try {
					const c = await api.get<Contact>(`/contacts/${inv.contactId}`)
					if (!cancelled) setContact(c)
				} catch {
					if (!cancelled) setContact(null)
				}
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

	async function runAction(label: string, fn: () => Promise<any>) {
		setActionBusy(true)
		setActionError(null)
		setActionSuccess(null)
		try {
			await fn()
			setActionSuccess(label)
			const inv = await api.get<Invoice>(`/invoices/${id}`)
			setInvoice(inv)
		} catch (e: any) {
			setActionError(e?.message ?? 'Action failed')
		} finally {
			setActionBusy(false)
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4 print:hidden">
				<div className="flex items-center gap-3">
					<Link to="/portal/orders">
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40">
							<ArrowLeft className="mr-2 size-4" />
							Back
						</Button>
					</Link>
					<div>
						<div className="text-2xl font-semibold tracking-tight">Invoice</div>
						<div className="mt-1 text-sm text-muted-foreground">Printable invoice view.</div>
					</div>
				</div>
				<div className="flex flex-wrap gap-2">
					{invoice?.state === 'DRAFT' ? (
						<Button
							disabled={actionBusy}
							onClick={() => void runAction('Invoice confirmed', () => api.post(`/invoices/${id}/confirm`, {}))}
						>
							Confirm
						</Button>
					) : null}

					{invoice?.state === 'CONFIRMED' ? (
						<div className="flex items-center gap-2">
							<select
								className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
								value={paymentMethod}
								onChange={(e) => setPaymentMethod(e.target.value as any)}
							>
								<option value="ONLINE">Online</option>
								<option value="CASH">Cash</option>
							</select>
							<Button
								disabled={actionBusy}
								onClick={() =>
								void runAction('Invoice paid', () =>
									api.post(`/invoices/${id}/pay`, {
										paymentMethod,
										paymentDate: new Date().toISOString(),
									}),
								)
							}
							>
								Pay
							</Button>
						</div>
					) : null}

					<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => window.print()}>
						<Printer className="mr-2 size-4" />
						Print
					</Button>
					<Button
						className="bg-muted/30 text-foreground hover:bg-muted/40"
						disabled={actionBusy}
						onClick={() =>
							void runAction('Downloaded', async () => {
								const res = await api.getBlob(`/invoices/${id}/pdf`)
								const file = res.blob
								const url = URL.createObjectURL(file)
								try {
									const a = document.createElement('a')
									a.href = url
									a.download = `${invoice?.number ?? `invoice-${id}`}.pdf`
									document.body.appendChild(a)
									a.click()
									a.remove()
								} finally {
									URL.revokeObjectURL(url)
								}
							})
						}
					>
						<Download className="mr-2 size-4" />
						Download PDF
					</Button>
				</div>
			</div>

			{loading ? <div className="text-sm text-muted-foreground">Loading…</div> : null}
			{error ? <div className="text-sm text-destructive">{error}</div> : null}
			{actionError ? <div className="text-sm text-destructive">{actionError}</div> : null}
			{actionSuccess ? <div className="text-sm text-emerald-700">{actionSuccess}</div> : null}

			{invoice ? (
				<Card className="max-w-4xl">
					<CardHeader>
						<CardTitle className="flex flex-wrap items-end justify-between gap-3">
							<span>{invoice.number}</span>
							<span className="text-sm text-muted-foreground">{invoice.state}</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="grid gap-4 md:grid-cols-3">
							<div>
								<div className="text-xs text-muted-foreground">Invoice Date</div>
								<div className="text-sm font-medium">{fmtDate(invoice.invoiceDate)}</div>
							</div>
							<div>
								<div className="text-xs text-muted-foreground">Due Date</div>
								<div className="text-sm font-medium">{fmtDate(invoice.dueDate)}</div>
							</div>
							<div>
								<div className="text-xs text-muted-foreground">Total</div>
								<div className="text-sm font-medium">{formatMoney(sumTotal(invoice))}</div>
							</div>
						</div>

						<div className="rounded-xl border border-border/60 bg-muted/10 p-3">
							<div className="text-sm font-medium">Address</div>
							<div className="mt-2 text-sm">
								<div className="font-medium">{contact?.name ?? '—'}</div>
								<div className="text-muted-foreground">{contact?.email ?? '—'}</div>
								<div className="text-muted-foreground">{contact?.address ?? '—'}</div>
							</div>
						</div>

						<div className="rounded-xl border border-border/60 bg-muted/10 p-3">
							<div className="text-sm font-medium">Products</div>
							<div className="mt-2 space-y-2">
								{invoice.lines?.length ? (
									invoice.lines.map((l) => (
										<div key={l.id} className="flex items-center justify-between gap-3 text-sm">
											<div className="min-w-0">
												<div className="truncate font-medium">{l.description ?? `Product #${l.productId}`}</div>
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
			) : null}
		</div>
	)
}
