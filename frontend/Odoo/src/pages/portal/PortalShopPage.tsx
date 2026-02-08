import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpDown, Plus, Search } from 'lucide-react'

import { api } from '@/lib/api'
import type { ListResponse, Product } from '@/pages/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatMoney } from '@/pages/app/ui'
import { useCart } from '@/context/CartContext'

type SortMode = 'PRICE_ASC' | 'PRICE_DESC' | 'NAME_ASC'

export function PortalShopPage() {
	const { addItem } = useCart()
	const [data, setData] = React.useState<Product[]>([])
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)
	const [query, setQuery] = React.useState('')
	const [sort, setSort] = React.useState<SortMode>('PRICE_ASC')

	React.useEffect(() => {
		let cancelled = false
		async function load() {
			setLoading(true)
			setError(null)
			try {
				const res = await api.get<ListResponse<Product>>('/products')
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

	const filtered = React.useMemo(() => {
		const q = query.trim().toLowerCase()
		let items = q
			? data.filter((p) => (p.name ?? '').toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q))
			: data
		items = [...items]
		items.sort((a, b) => {
			if (sort === 'NAME_ASC') return a.name.localeCompare(b.name)
			if (sort === 'PRICE_DESC') return b.salesPrice - a.salesPrice
			return a.salesPrice - b.salesPrice
		})
		return items
	}, [data, query, sort])

	return (
		<div className="space-y-5">
			<div className="rounded-3xl border border-border/60 bg-card/20 p-6">
				<div className="text-2xl font-semibold tracking-tight">Shop</div>
				<div className="mt-1 text-sm text-muted-foreground">Browse products, search, sort, and checkout.</div>

				<div className="mt-4 grid gap-3 md:grid-cols-3">
					<div className="md:col-span-2">
						<div className="relative">
							<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="pl-10" />
						</div>
					</div>
					<div>
						<div className="relative">
							<ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<select
								className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm"
								value={sort}
								onChange={(e) => setSort(e.target.value as SortMode)}
							>
								<option value="PRICE_ASC">Sort by: Price (low → high)</option>
								<option value="PRICE_DESC">Sort by: Price (high → low)</option>
								<option value="NAME_ASC">Sort by: Name</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{loading ? <div className="text-sm text-muted-foreground">Loading…</div> : null}
			{error ? <div className="text-sm text-destructive">{error}</div> : null}

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{filtered.map((p) => (
					<Card key={p.id} className="overflow-hidden">
						<CardHeader>
							<CardTitle className="flex items-center justify-between gap-3">
								<Link className="hover:underline" to={`/portal/products/${p.id}`}>
									{p.name}
								</Link>
								<span className="text-sm text-muted-foreground">{formatMoney(p.salesPrice)}</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="text-sm text-muted-foreground">{p.description ?? '—'}</div>
							<div className="flex items-center justify-between gap-2">
								<Link to={`/portal/products/${p.id}`} className="text-sm text-primary hover:underline">
									View
								</Link>
								<Button
									className="bg-muted/30 text-foreground hover:bg-muted/40"
									onClick={() => addItem({ productId: p.id, name: p.name, unitPrice: p.salesPrice }, 1)}
								>
									<Plus className="mr-2 size-4" />
									Add
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}
