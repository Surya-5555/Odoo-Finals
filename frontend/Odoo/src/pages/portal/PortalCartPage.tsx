import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Tag, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { formatMoney } from '@/pages/app/ui'
import { useCart } from '@/context/CartContext'

export function PortalCartPage() {
	const navigate = useNavigate()
	const { items, subtotal, setQuantity, removeItem, clear } = useCart()

	const [discountCode, setDiscountCode] = React.useState('')
	const [discountApplied, setDiscountApplied] = React.useState<{ code: string; percent: number } | null>(null)
	const [discountError, setDiscountError] = React.useState<string | null>(null)

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

	const discountPercent = discountApplied?.percent ?? 0
	const discountAmount = subtotal * (discountPercent / 100)
	const total = subtotal - discountAmount

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
						<div className="text-2xl font-semibold tracking-tight">Cart</div>
						<div className="mt-1 text-sm text-muted-foreground">Review items and proceed to checkout.</div>
					</div>
				</div>
				<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => clear()}>
					<Trash2 className="mr-2 size-4" />
					Clear cart
				</Button>
			</div>

			{discountError ? <div className="text-sm text-destructive">{discountError}</div> : null}

			<div className="grid gap-4 lg:grid-cols-3">
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Order</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{!items.length ? (
							<div className="text-sm text-muted-foreground">Your cart is empty.</div>
						) : (
							items.map((it) => (
								<div
									key={it.productId}
									className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/10 p-3"
								>
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
						<CardTitle>Summary</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Subtotal</span>
								<span className="font-medium">{formatMoney(subtotal)}</span>
							</div>
							{discountApplied ? (
								<>
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Discount</span>
										<span className="font-medium">
											{discountApplied.code} ({discountPercent.toFixed(2)}%)
										</span>
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

						<div>
							<Label>Discount code</Label>
							<div className="mt-2 flex gap-2">
								<Input value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="CODE" />
								<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={onApplyDiscount}>
									<Tag className="mr-2 size-4" />
									Apply
								</Button>
							</div>
							{discountApplied ? (
								<div className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-800">
									<BadgeCheck className="size-4" />
									Applied {discountApplied.code}
								</div>
							) : null}
						</div>

						<Button disabled={!items.length} onClick={() => navigate(`/portal/checkout?discount=${encodeURIComponent(discountApplied?.code ?? '')}`)}>
							Checkout
						</Button>
						<div className="text-xs text-muted-foreground">Next: address and payment.</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
