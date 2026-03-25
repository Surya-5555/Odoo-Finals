import * as React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Tag, Trash2 } from 'lucide-react'

import { api } from '@/lib/api'
import type { Contact, ListResponse, RecurringPlan, Subscription } from '@/pages/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatMoney } from '@/pages/app/ui'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'

type PaymentMethod = 'ONLINE' | 'CASH'

function pickDefaultPlan(plans: RecurringPlan[]) {
	return plans.find((p) => p.prices?.some((x) => x.isDefault)) ?? plans[0] ?? null
}

export function PortalCheckoutPage() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const { user } = useAuth()
	const { items, subtotal, setQuantity, removeItem, clear } = useCart()

	const [plans, setPlans] = React.useState<RecurringPlan[]>([])
	const [planId, setPlanId] = React.useState<number | ''>('')
	const [loadingPlans, setLoadingPlans] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)
	const [placing, setPlacing] = React.useState(false)

	const [discountCode, setDiscountCode] = React.useState('')
	const [discountApplied, setDiscountApplied] = React.useState<{ code: string; percent: number } | null>(null)
	const [discountError, setDiscountError] = React.useState<string | null>(null)
	const initializedDiscountFromUrl = React.useRef(false)

	const [address, setAddress] = React.useState('')
	const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('ONLINE')

	React.useEffect(() => {
		let cancelled = false
		async function load() {
			setLoadingPlans(true)
			try {
				const res = await api.get<ListResponse<RecurringPlan>>('/recurring-plans')
				if (cancelled) return
				setPlans(res.data)
				const d = pickDefaultPlan(res.data)
				setPlanId(d?.id ?? '')

				// Excalidraw: address page shows default user address first.
				if (user?.id) {
					const contacts = await api.get<ListResponse<Contact>>('/contacts', { userId: user.id, take: 1 })
					const c = contacts.data?.[0]
					if (c?.address && !cancelled) setAddress(c.address)
				}
			} catch (e: any) {
				setError(e?.message ?? 'Failed to load plans')
			} finally {
				setLoadingPlans(false)
			}
		}
		void load()
		return () => {
			cancelled = true
		}
	}, [user?.id])

	async function onApplyDiscount() {
		const code = discountCode.trim()
		setDiscountError(null)
		if (!code) {
			setDiscountApplied(null)
			return
		}

		try {
			const res = await api.get<{ code: string; percent: number }>('/discounts/validate', { code })
			setDiscountApplied({ code: res.code, percent: Number(res.percent) })
		} catch (e: any) {
			setDiscountApplied(null)
			setDiscountError(e?.message ?? 'Invalid discount code')
		}
	}

	React.useEffect(() => {
		if (initializedDiscountFromUrl.current) return
		const urlCode = (searchParams.get('discount') ?? '').trim()
		if (!urlCode) {
			initializedDiscountFromUrl.current = true
			return
		}
		initializedDiscountFromUrl.current = true
		setDiscountCode(urlCode)
		void (async () => {
			setDiscountError(null)
			try {
				const res = await api.get<{ code: string; percent: number }>('/discounts/validate', { code: urlCode })
				setDiscountApplied({ code: res.code, percent: Number(res.percent) })
			} catch (e: any) {
				setDiscountApplied(null)
				setDiscountError(e?.message ?? 'Invalid discount code')
			}
		})()
	}, [searchParams])

	async function getOrCreateContact(): Promise<Contact> {
		if (!user?.email) throw new Error('Login user email missing')
		const list = await api.get<ListResponse<Contact>>('/contacts', { email: user.email, take: 1 })
		const existing = list.data[0]
		if (existing) return existing
		return await api.post<Contact>('/contacts', {
			name: user.name ?? user.email,
			email: user.email,
			address: address.trim() ? address.trim() : undefined,
			userId: user.id,
		})
	}

	async function placeOrder() {
		setPlacing(true)
		setError(null)
		try {
			if (!items.length) throw new Error('Cart is empty')
			if (!planId) throw new Error('Select a recurring plan')

			const contact = await getOrCreateContact()

			const payload = {
				contactId: contact.id,
				recurringPlanId: Number(planId),
				orderDate: new Date().toISOString(),
				lines: items.map((it) => ({
					productId: it.productId,
					quantity: it.quantity,
					unitPrice: it.unitPrice,
				})),
				// Excalidraw parity fields (currently UI-only):
				portal: {
					paymentMethod,
					discountCode: discountApplied?.code ?? undefined,
					discountPercent: discountApplied?.percent ?? undefined,
					address: address.trim() ? address.trim() : undefined,
				},
			}

			const sub = await api.post<Subscription>('/subscriptions', payload)
			clear()
			navigate(`/portal/order-success?subscriptionId=${sub.id}`)
		} catch (e: any) {
			setError(e?.message ?? 'Checkout failed')
		} finally {
			setPlacing(false)
		}
	}

	return (
		<div className="space-y-5">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<Link to="/portal/shop">
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40">
							<ArrowLeft className="mr-2 size-4" />
							Back
						</Button>
					</Link>
					<div>
						<div className="text-2xl font-semibold tracking-tight">Checkout</div>
						<div className="mt-1 text-sm text-muted-foreground">Address + payment + discount, then place order.</div>
					</div>
				</div>
				<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => clear()}>
					<Trash2 className="mr-2 size-4" />
					Clear cart
				</Button>
			</div>

			{error ? <div className="text-sm text-destructive">{error}</div> : null}
			{discountError ? <div className="text-sm text-destructive">{discountError}</div> : null}

			<div className="grid gap-4 lg:grid-cols-3">
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Cart</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{!items.length ? (
							<div className="text-sm text-muted-foreground">Your cart is empty.</div>
						) : (
							items.map((it) => (
								<div key={it.productId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/10 p-3">
									<div>
										<div className="font-medium">{it.name}</div>
										<div className="text-xs text-muted-foreground">{formatMoney(it.unitPrice)} each</div>
									</div>
									<div className="flex items-center gap-2">
										<Input
											type="number"
											min={1}
											value={it.quantity}
											onChange={(e) => setQuantity(it.productId, Math.max(1, Number(e.target.value)))}
											className="w-24"
										/>
										<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => removeItem(it.productId)}>
											Remove
										</Button>
									</div>
								</div>
							))
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Order</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{(() => {
							const discountPercent = discountApplied?.percent ?? 0
							const discountAmount = subtotal * (discountPercent / 100)
							const total = subtotal - discountAmount
							return (
						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Subtotal</span>
								<span className="font-medium">{formatMoney(subtotal)}</span>
							</div>
							{discountApplied ? (
								<>
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Discount</span>
										<span className="font-medium">{discountApplied.code} ({discountPercent.toFixed(2)}%)</span>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Discount amount</span>
										<span className="font-medium">- {formatMoney(discountAmount)}</span>
									</div>
								</>
							) : null}
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Total</span>
								<span className="font-medium">{formatMoney(total)}</span>
							</div>
						</div>
							)
						})()}

						<div>
							<Label>Recurring plan</Label>
							{loadingPlans ? (
								<div className="text-sm text-muted-foreground">Loading plans…</div>
							) : (
								<select
									className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm"
									value={planId}
									onChange={(e) => setPlanId(e.target.value ? Number(e.target.value) : '')}
								>
									<option value="">Select plan…</option>
									{plans.map((p) => (
										<option key={p.id} value={p.id}>
											{p.name}
										</option>
									))}
								</select>
							)}
						</div>

						<div>
							<Label>Discount code</Label>
							<div className="flex gap-2">
								<Input value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="e.g. SAVE10" />
								<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => void onApplyDiscount()}>
									<Tag className="mr-2 size-4" />
									Apply
								</Button>
							</div>
							<div className="mt-1 text-xs text-muted-foreground">Validates against active discount codes.</div>
						</div>

						<div>
							<Label>Address</Label>
							<Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Billing address…" />
						</div>

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

						<Button onClick={placeOrder} disabled={placing || !items.length}>
							<BadgeCheck className="mr-2 size-4" />
							{placing ? 'Placing…' : 'Place order'}
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
