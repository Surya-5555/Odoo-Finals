import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'

import { api } from '@/lib/api'
import type { Product } from '@/pages/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function ProductFormPage({ mode }: { mode: 'create' | 'edit' }) {
	const navigate = useNavigate()
	const params = useParams()
	const id = Number(params.id)

	const [loading, setLoading] = React.useState(mode === 'edit')
	const [saving, setSaving] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)

	const [name, setName] = React.useState('')
	const [productType, setProductType] = React.useState('')
	const [salesPrice, setSalesPrice] = React.useState<number>(0)
	const [costPrice, setCostPrice] = React.useState<number | ''>('')
	const [description, setDescription] = React.useState('')

	React.useEffect(() => {
		if (mode !== 'edit') return
		if (!Number.isFinite(id)) return
		let cancelled = false
		async function load() {
			setLoading(true)
			setError(null)
			try {
				const p = await api.get<Product>(`/products/${id}`)
				if (cancelled) return
				setName(p.name)
				setProductType(p.productType ?? '')
				setSalesPrice(p.salesPrice)
				setCostPrice(p.costPrice ?? '')
				setDescription(p.description ?? '')
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
	}, [mode, id])

	async function onSave() {
		setSaving(true)
		setError(null)
		try {
			if (!name.trim()) throw new Error('Name is required')
			if (salesPrice < 0) throw new Error('Sales price must be >= 0')
			const payload = {
				name: name.trim(),
				productType: productType.trim() ? productType.trim() : undefined,
				salesPrice: Number(salesPrice),
				costPrice: costPrice === '' ? undefined : Number(costPrice),
				description: description.trim() ? description.trim() : undefined,
			}
			if (mode === 'create') {
				await api.post<Product>('/products', payload)
			} else {
				await api.patch<Product>(`/products/${id}`, payload)
			}
			navigate('/app/products')
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
					<Link to="/app/products">
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40">
							<ArrowLeft className="mr-2 size-4" />
							Back
						</Button>
					</Link>
					<div>
						<div className="text-2xl font-semibold tracking-tight">{mode === 'create' ? 'New Product' : 'Edit Product'}</div>
						<div className="mt-1 text-sm text-muted-foreground">Products appear in subscription lines.</div>
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
				<Card className="max-w-3xl">
					<CardHeader>
						<CardTitle>Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<Label>Name</Label>
								<Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. SaaS License" />
							</div>
							<div>
								<Label>Type (optional)</Label>
								<Input value={productType} onChange={(e) => setProductType(e.target.value)} placeholder="e.g. Service" />
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<Label>Sales Price</Label>
								<Input type="number" min={0} value={salesPrice} onChange={(e) => setSalesPrice(Number(e.target.value))} />
							</div>
							<div>
								<Label>Cost Price (optional)</Label>
								<Input
									type="number"
									min={0}
									value={costPrice}
									onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
								/>
							</div>
						</div>

						<div>
							<Label>Description (optional)</Label>
							<Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Internal description…" />
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
