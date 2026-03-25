import * as React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'

import { api } from '@/lib/api'
import type { ListResponse, Product } from '@/pages/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { formatMoney } from '@/pages/app/ui'
import { PageHeader } from '@/components/odoo/PageHeader'

export function ProductsPage() {
	const [data, setData] = React.useState<ListResponse<Product> | null>(null)
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)

	async function load() {
		setLoading(true)
		setError(null)
		try {
			const res = await api.get<ListResponse<Product>>('/products')
			setData(res)
		} catch (e: any) {
			setError(e?.message ?? 'Failed to load')
		} finally {
			setLoading(false)
		}
	}

	React.useEffect(() => {
		void load()
	}, [])

	async function onDelete(id: number) {
		if (!confirm('Delete this product?')) return
		try {
			await api.delete(`/products/${id}`)
			await load()
		} catch (e: any) {
			alert(e?.message ?? 'Delete failed')
		}
	}

	return (
		<div className="space-y-4">
			<PageHeader
				title="Products"
				subtitle="Manage products used in subscription lines."
				actions={
					<Link to="/app/products/new">
						<Button>
							<Plus className="mr-2 size-4" />
							New
						</Button>
					</Link>
				}
			/>

			<Card>
				<CardHeader>
					<CardTitle>All products</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="text-sm text-muted-foreground">Loading…</div>
					) : error ? (
						<div className="text-sm text-red-300">{error}</div>
					) : !data?.data?.length ? (
						<div className="text-sm text-muted-foreground">No products yet.</div>
					) : (
						<Table>
							<THead>
								<TR>
									<TH>Name</TH>
									<TH>Type</TH>
									<TH>Sales price</TH>
									<TH className="text-right">Actions</TH>
								</TR>
							</THead>
							<TBody>
								{data.data.map((p) => (
									<TR key={p.id}>
										<TD>
											<Link className="font-medium hover:underline" to={`/app/products/${p.id}`}>
												{p.name}
											</Link>
										</TD>
										<TD className="text-muted-foreground">{p.productType ?? '—'}</TD>
										<TD className="text-muted-foreground">{formatMoney(p.salesPrice)}</TD>
										<TD className="text-right">
											<div className="inline-flex items-center gap-2">
												<Link to={`/app/products/${p.id}`}>
													<Button className="bg-muted/30 text-foreground hover:bg-muted/40">Edit</Button>
												</Link>
												<Button className="bg-destructive hover:brightness-110" onClick={() => onDelete(p.id)}>
													<Trash2 className="size-4" />
												</Button>
											</div>
										</TD>
									</TR>
								))}
							</TBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
