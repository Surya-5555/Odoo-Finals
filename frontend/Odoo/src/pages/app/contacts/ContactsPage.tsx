import * as React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'

import { api } from '@/lib/api'
import type { Contact, ListResponse } from '@/pages/app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { PageHeader } from '@/components/odoo/PageHeader'

export function ContactsPage() {
	const [data, setData] = React.useState<ListResponse<Contact> | null>(null)
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)

	async function load() {
		setLoading(true)
		setError(null)
		try {
			const res = await api.get<ListResponse<Contact>>('/contacts')
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
		if (!confirm('Delete this contact?')) return
		try {
			await api.delete(`/contacts/${id}`)
			await load()
		} catch (e: any) {
			alert(e?.message ?? 'Delete failed')
		}
	}

	return (
		<div className="space-y-4">
			<PageHeader
				title="Contacts"
				subtitle="Customers and linked portal users."
				actions={
					<Link to="/app/contacts/new">
						<Button>
							<Plus className="mr-2 size-4" />
							New
						</Button>
					</Link>
				}
			/>

			<Card>
				<CardHeader>
					<CardTitle>All contacts</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="text-sm text-muted-foreground">Loading…</div>
					) : error ? (
						<div className="text-sm text-red-300">{error}</div>
					) : !data?.data?.length ? (
						<div className="text-sm text-muted-foreground">No contacts yet.</div>
					) : (
						<Table>
							<THead>
								<TR>
									<TH>Name</TH>
									<TH>Email</TH>
									<TH>Phone</TH>
									<TH>Company</TH>
									<TH>Active subs</TH>
									<TH className="text-right">Actions</TH>
								</TR>
							</THead>
							<TBody>
								{data.data.map((c) => (
									<TR key={c.id}>
										<TD>
											<Link className="font-medium hover:underline" to={`/app/contacts/${c.id}`}>
												{c.name}
											</Link>
											<div className="text-xs text-muted-foreground">ID: {c.id}{c.userId ? ` • User: ${c.userId}` : ''}</div>
										</TD>
										<TD className="text-muted-foreground">{c.email}</TD>
										<TD className="text-muted-foreground">{c.phone ?? '—'}</TD>
										<TD className="text-muted-foreground">{c.companyName ?? '—'}</TD>
										<TD className="text-muted-foreground">{c.activeSubscriptionsCount ?? '—'}</TD>
										<TD className="text-right">
											<div className="inline-flex items-center gap-2">
												<Link to={`/app/contacts/${c.id}`}>
													<Button className="bg-muted/30 text-foreground hover:bg-muted/40">Edit</Button>
												</Link>
												<Button className="bg-destructive hover:brightness-110" onClick={() => onDelete(c.id)}>
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
