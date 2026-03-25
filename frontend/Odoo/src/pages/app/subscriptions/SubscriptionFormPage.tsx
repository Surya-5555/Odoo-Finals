import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Save, X } from 'lucide-react'

import { api } from '@/lib/api'
import type { Contact, ListResponse, PaymentTerm, Product, QuotationTemplate, RecurringPlan, Subscription } from '@/pages/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type LineDraft = {
	_key: string
	productId: number | ''
	quantity: number
	unitPrice: number
	discountPercent: number | ''
	taxPercent: number | ''
}

function newLine(): LineDraft {
	return {
		_key: crypto.randomUUID(),
		productId: '',
		quantity: 1,
		unitPrice: 0,
		discountPercent: '',
		taxPercent: '',
	}
}

export function SubscriptionFormPage({ mode }: { mode: 'create' | 'edit' }) {
	const navigate = useNavigate()
	const params = useParams()
	const id = Number(params.id)

	const [loading, setLoading] = React.useState(true)
	const [saving, setSaving] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)

	const [contacts, setContacts] = React.useState<Contact[]>([])
	const [plans, setPlans] = React.useState<RecurringPlan[]>([])
	const [products, setProducts] = React.useState<Product[]>([])
	const [paymentTerms, setPaymentTerms] = React.useState<PaymentTerm[]>([])
	const [quotationTemplates, setQuotationTemplates] = React.useState<QuotationTemplate[]>([])

	const [contactId, setContactId] = React.useState<number | ''>('')
	const [recurringPlanId, setRecurringPlanId] = React.useState<number | ''>('')
	const [expirationDate, setExpirationDate] = React.useState<string>('')
	const [orderDate, setOrderDate] = React.useState<string>('')
	const [quotationTemplateId, setQuotationTemplateId] = React.useState<number | ''>('')
	const [paymentTermId, setPaymentTermId] = React.useState<number | ''>('')
	const [salespersonId, setSalespersonId] = React.useState<number | ''>('')
	const [lines, setLines] = React.useState<LineDraft[]>([newLine()])

	React.useEffect(() => {
		let cancelled = false
		async function loadAll() {
			setLoading(true)
			setError(null)
			try {
				const [c, p, pr, pt, qt] = await Promise.all([
					api.get<ListResponse<Contact>>('/contacts'),
					api.get<ListResponse<RecurringPlan>>('/recurring-plans'),
					api.get<ListResponse<Product>>('/products'),
					api.get<ListResponse<PaymentTerm>>('/payment-terms'),
					api.get<ListResponse<QuotationTemplate>>('/quotation-templates'),
				])
				if (cancelled) return
				setContacts(c.data)
				setPlans(p.data)
				setProducts(pr.data)
				setPaymentTerms(pt.data)
				setQuotationTemplates(qt.data)

				if (mode === 'edit' && Number.isFinite(id)) {
					const s = await api.get<Subscription>(`/subscriptions/${id}`)
					if (cancelled) return
					setContactId(s.contactId)
					setRecurringPlanId(s.recurringPlanId)
					setExpirationDate(s.expirationDate ? s.expirationDate.slice(0, 10) : '')
					setOrderDate(s.orderDate ? s.orderDate.slice(0, 10) : '')
					setQuotationTemplateId(s.quotationTemplateId ?? '')
					setPaymentTermId(s.paymentTermId ?? '')
					setSalespersonId(s.salespersonId ?? '')
					setLines(
						s.lines?.length
							? s.lines.map((l) => ({
								_key: crypto.randomUUID(),
								productId: l.productId,
								quantity: Number(l.quantity),
								unitPrice: Number(l.unitPrice),
								discountPercent: l.discountPercent ?? '',
								taxPercent: l.taxPercent ?? '',
							}))
							: [newLine()],
					)
				}
			} catch (e: any) {
				setError(e?.message ?? 'Failed to load')
			} finally {
				setLoading(false)
			}
		}
		void loadAll()
		return () => {
			cancelled = true
		}
	}, [mode, id])

	function findProduct(pid: number) {
		return products.find((p) => p.id === pid)
	}

	async function onSave() {
		setSaving(true)
		setError(null)
		try {
			if (!contactId) throw new Error('Customer is required')
			if (!recurringPlanId) throw new Error('Recurring plan is required')

			const cleanLines = lines
				.filter((l) => l.productId !== '' && l.quantity > 0)
				.map((l) => ({
					productId: Number(l.productId),
					quantity: Number(l.quantity),
					unitPrice: Number(l.unitPrice),
					discountPercent: l.discountPercent === '' ? undefined : Number(l.discountPercent),
					taxPercent: l.taxPercent === '' ? undefined : Number(l.taxPercent),
				}))

			const payload = {
				contactId: Number(contactId),
				recurringPlanId: Number(recurringPlanId),
				expirationDate: expirationDate ? new Date(expirationDate).toISOString() : undefined,
				quotationTemplateId: quotationTemplateId === '' ? undefined : Number(quotationTemplateId),
				orderDate: orderDate ? new Date(orderDate).toISOString() : undefined,
				paymentTermId: paymentTermId === '' ? undefined : Number(paymentTermId),
				salespersonId: salespersonId === '' ? undefined : Number(salespersonId),
				lines: cleanLines.length ? cleanLines : [],
			}

			if (mode === 'create') {
				const created = await api.post<Subscription>('/subscriptions', payload)
				navigate(`/app/subscriptions/${created.id}`)
			} else {
				await api.patch<Subscription>(`/subscriptions/${id}`, payload)
				navigate(`/app/subscriptions/${id}`)
			}
		} catch (e: any) {
			setError(e?.message ?? 'Save failed')
		} finally {
			setSaving(false)
		}
	}

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
						<div className="text-2xl font-semibold tracking-tight">{mode === 'create' ? 'New Subscription' : 'Edit Subscription'}</div>
						<div className="mt-1 text-sm text-muted-foreground">Create quotation and add order lines.</div>
					</div>
				</div>
				<Button onClick={onSave} disabled={saving || loading}>
					<Save className="mr-2 size-4" />
					{saving ? 'Saving…' : 'Save'}
				</Button>
			</div>

			{error ? <div className="text-sm text-red-300">{error}</div> : null}
			{loading ? (
				<div className="text-sm text-muted-foreground">Loading…</div>
			) : (
				<div className="grid gap-4 xl:grid-cols-3">
					<Card className="xl:col-span-2">
						<CardHeader>
							<CardTitle>Subscription</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<Label>Customer</Label>
									<select
										className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm"
										value={contactId}
										onChange={(e) => setContactId(e.target.value ? Number(e.target.value) : '')}
									>
										<option value="">Select customer…</option>
										{contacts.map((c) => (
											<option key={c.id} value={c.id}>
												{c.name} ({c.email})
											</option>
										))}
									</select>
								</div>
								<div>
									<Label>Recurring Plan</Label>
									<select
										className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm"
										value={recurringPlanId}
										onChange={(e) => setRecurringPlanId(e.target.value ? Number(e.target.value) : '')}
									>
										<option value="">Select plan…</option>
										{plans.map((p) => (
											<option key={p.id} value={p.id}>
												{p.name}
											</option>
										))}
									</select>
								</div>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<Label>Quotation expiration (optional)</Label>
									<Input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
								</div>
								<div>
									<Label>Order date (optional)</Label>
									<Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
								</div>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<Label>Quotation template (optional)</Label>
									<select
										className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm"
										value={quotationTemplateId}
										onChange={(e) => setQuotationTemplateId(e.target.value ? Number(e.target.value) : '')}
									>
										<option value="">No template</option>
										{quotationTemplates.map((t) => (
											<option key={t.id} value={t.id}>
												{t.name}
											</option>
										))}
									</select>
									<div className="mt-1 text-xs text-muted-foreground">
										Manage templates in <Link className="underline" to="/app/quotation-templates">Quotation Templates</Link>.
									</div>
								</div>
								<div>
									<Label>Payment term (optional)</Label>
									<select
										className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm"
										value={paymentTermId}
										onChange={(e) => setPaymentTermId(e.target.value ? Number(e.target.value) : '')}
									>
										<option value="">No payment term</option>
										{paymentTerms.map((t) => (
											<option key={t.id} value={t.id}>
												{t.name} (Due +{t.dueAfterDays}d)
											</option>
										))}
									</select>
									<div className="mt-1 text-xs text-muted-foreground">
										Manage terms in <Link className="underline" to="/app/payment-terms">Payment Terms</Link>.
									</div>
								</div>
								<div>
									<Label>Salesperson id (optional)</Label>
									<Input
										type="number"
										min={1}
										value={salespersonId}
										onChange={(e) => setSalespersonId(e.target.value === '' ? '' : Number(e.target.value))}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Order lines</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{lines.map((l) => {
								const prod = l.productId !== '' ? findProduct(Number(l.productId)) : undefined
								return (
									<div key={l._key} className="rounded-xl border border-border/60 bg-muted/10 p-3 space-y-3">
										<div className="flex items-center justify-between">
											<div className="text-sm font-medium">{prod?.name ?? 'Line'}</div>
											<Button
												className="bg-muted/30 text-foreground hover:bg-muted/40"
												onClick={() => setLines((prev) => prev.filter((x) => x._key !== l._key))}
												disabled={lines.length <= 1}
											>
												<X className="size-4" />
											</Button>
										</div>

										<div className="grid gap-3 md:grid-cols-2">
											<div>
												<Label>Product</Label>
												<select
													className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm"
													value={l.productId}
													onChange={(e) => {
													const next = e.target.value ? Number(e.target.value) : ''
													const p = next !== '' ? findProduct(Number(next)) : undefined
													setLines((prev) =>
														prev.map((x) =>
															x._key === l._key
															? {
																	...x,
																	productId: next,
																	unitPrice: p ? p.salesPrice : x.unitPrice,
																}
															: x,
														),
													)
												}}
												>
													<option value="">Select…</option>
													{products.map((p) => (
														<option key={p.id} value={p.id}>
															{p.name}
														</option>
													))}
												</select>
											</div>
											<div>
												<Label>Quantity</Label>
												<Input
													type="number"
													min={0.01}
													value={l.quantity}
													onChange={(e) => {
														setLines((prev) =>
															prev.map((x) => (x._key === l._key ? { ...x, quantity: Number(e.target.value) } : x)),
														)
													}}
												/>
											</div>
										</div>

										<div className="grid gap-3 md:grid-cols-2">
											<div>
												<Label>Unit price</Label>
												<Input
													type="number"
													min={0}
													value={l.unitPrice}
													onChange={(e) => {
														setLines((prev) =>
															prev.map((x) => (x._key === l._key ? { ...x, unitPrice: Number(e.target.value) } : x)),
														)
													}}
												/>
											</div>
											<div className="grid grid-cols-2 gap-3">
												<div>
													<Label>Disc %</Label>
													<Input
														type="number"
														min={0}
														value={l.discountPercent}
													onChange={(e) => {
														setLines((prev) =>
															prev.map((x) =>
																x._key === l._key
																? { ...x, discountPercent: e.target.value === '' ? '' : Number(e.target.value) }
																: x,
															),
														)
												}}
													/>
												</div>
												<div>
													<Label>Tax %</Label>
													<Input
														type="number"
														min={0}
														value={l.taxPercent}
													onChange={(e) => {
														setLines((prev) =>
															prev.map((x) =>
																x._key === l._key
																? { ...x, taxPercent: e.target.value === '' ? '' : Number(e.target.value) }
																: x,
															),
														)
												}}
													/>
												</div>
											</div>
										</div>
									</div>
								)
							})}

							<Button
								className="w-full bg-muted/30 text-foreground hover:bg-muted/40"
								onClick={() => setLines((prev) => [...prev, newLine()])}
							>
								<Plus className="mr-2 size-4" />
								Add line
							</Button>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	)
}
