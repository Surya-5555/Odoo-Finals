import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, ShoppingCart } from 'lucide-react'

import { api } from '@/lib/api'
import type { Product } from '@/pages/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatMoney } from '@/pages/app/ui'
import { useCart } from '@/context/CartContext'

export function PortalProductDetailPage() {
	const params = useParams()
	const id = Number(params.id)
	const { addItem } = useCart()

	const [product, setProduct] = React.useState<Product | null>(null)
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)
	const [qty, setQty] = React.useState<number>(1)

	React.useEffect(() => {
		if (!Number.isFinite(id)) return
		let cancelled = false
		async function load() {
			setLoading(true)
			setError(null)
			try {
				const p = await api.get<Product>(`/products/${id}`)
				if (cancelled) return
				setProduct(p)
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

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<Link to="/portal/shop">
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40">
							<ArrowLeft className="mr-2 size-4" />
							Back
						</Button>
					</Link>
					<div>
						<div className="text-2xl font-semibold tracking-tight">Product</div>
						<div className="mt-1 text-sm text-muted-foreground">Review and add to cart.</div>
					</div>
				</div>
				<Link to="/portal/checkout">
					<Button className="bg-muted/30 text-foreground hover:bg-muted/40">
						<ShoppingCart className="mr-2 size-4" />
						Checkout
					</Button>
				</Link>
			</div>

			{loading ? <div className="text-sm text-muted-foreground">Loading…</div> : null}
			{error ? <div className="text-sm text-red-300">{error}</div> : null}

			{product ? (
				<Card className="max-w-3xl">
					<CardHeader>
						<CardTitle className="flex items-center justify-between gap-3">
							<span>{product.name}</span>
							<span className="text-sm text-muted-foreground">{formatMoney(product.salesPrice)}</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="text-sm text-muted-foreground">{product.description ?? '—'}</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<Label>Quantity</Label>
								<Input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} />
							</div>
						</div>

						<Button
							onClick={() => addItem({ productId: product.id, name: product.name, unitPrice: product.salesPrice }, qty)}
						>
							<Plus className="mr-2 size-4" />
							Add to cart
						</Button>
					</CardContent>
				</Card>
			) : null}
		</div>
	)
}
