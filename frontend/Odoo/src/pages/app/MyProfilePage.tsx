import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Pencil, Save, Shield, Undo2 } from 'lucide-react'

import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import type { Contact, ListResponse } from '@/pages/app/types'
import { PageHeader } from '@/components/odoo/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type MeResponse = {
	id: number
	name: string
	email: string
	role: 'ADMIN' | 'PORTAL' | 'INTERNAL'
	createdAt: string
}

export function MyProfilePage() {
	const navigate = useNavigate()
	const { user, accessToken, login, logout } = useAuth()
	const [editMode, setEditMode] = React.useState(false)

	const [loading, setLoading] = React.useState(true)
	const [saving, setSaving] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)
	const [success, setSuccess] = React.useState<string | null>(null)

	const [me, setMe] = React.useState<MeResponse | null>(null)
	const [contact, setContact] = React.useState<Contact | null>(null)

	const [name, setName] = React.useState('')
	const [email, setEmail] = React.useState('')
	const [phone, setPhone] = React.useState('')
	const [companyName, setCompanyName] = React.useState('')
	const [address, setAddress] = React.useState('')

	const [pwCurrent, setPwCurrent] = React.useState('')
	const [pwNew, setPwNew] = React.useState('')
	const [pwConfirm, setPwConfirm] = React.useState('')
	const [pwSaving, setPwSaving] = React.useState(false)
	const [pwError, setPwError] = React.useState<string | null>(null)
	const [pwSuccess, setPwSuccess] = React.useState<string | null>(null)

	const effectiveUserId = me?.id ?? user?.id

	React.useEffect(() => {
		// Fallback: show locally stored login info immediately.
		if (!me && user) {
			setMe({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: '' })
			setName(user.name ?? '')
			setEmail(user.email ?? '')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.id])

	const dirty = React.useMemo(() => {
		const baseName = me?.name ?? ''
		const baseEmail = me?.email ?? ''
		const basePhone = contact?.phone ?? ''
		const baseCompany = contact?.companyName ?? ''
		const baseAddress = contact?.address ?? ''
		return (
			name.trim() !== baseName ||
			email.trim() !== baseEmail ||
			phone.trim() !== basePhone ||
			companyName.trim() !== baseCompany ||
			address.trim() !== baseAddress
		)
	}, [address, companyName, contact?.address, contact?.companyName, contact?.phone, email, me?.email, me?.name, name, phone])

	const syncForm = React.useCallback((nextMe: MeResponse | null, nextContact: Contact | null) => {
		setName(nextMe?.name ?? '')
		setEmail(nextMe?.email ?? '')
		setPhone(nextContact?.phone ?? '')
		setCompanyName(nextContact?.companyName ?? '')
		setAddress(nextContact?.address ?? '')
	}, [])

	const load = React.useCallback(async () => {
		setLoading(true)
		setError(null)
		setSuccess(null)
		try {
			const nextMe = await api.get<MeResponse>('/users/me')
			if (!nextMe || typeof (nextMe as any).id !== 'number') {
				throw new Error('Failed to load profile')
			}
			setMe(nextMe)

			const contacts = await api.get<ListResponse<Contact>>('/contacts', { userId: nextMe.id, take: 1 })
			const nextContact = contacts.data?.[0] ?? null
			setContact(nextContact)
			syncForm(nextMe, nextContact)
			setEditMode(false)
		} catch (e: any) {
			setError(e?.message ?? 'Failed to load profile')
		} finally {
			setLoading(false)
		}
	}, [syncForm])

	React.useEffect(() => {
		void load()
	}, [load])

	async function onSave() {
		setSaving(true)
		setError(null)
		setSuccess(null)
		try {
			if (!editMode) return
			if (!name.trim()) throw new Error('Name is required')
			if (!email.trim()) throw new Error('Email is required')

			let nextMe = me
			const nameChanged = name.trim() !== (me?.name ?? '')
			const emailChanged = email.trim() !== (me?.email ?? '')
			if (nameChanged || emailChanged) {
				nextMe = await api.patch<MeResponse>('/users/me', {
					...(nameChanged ? { name: name.trim() } : {}),
					...(emailChanged ? { email: email.trim() } : {}),
				})
				setMe(nextMe)

				const token = accessToken ?? localStorage.getItem('odoo_access_token')
				if (token) {
					login(token, { id: nextMe.id, name: nextMe.name, email: nextMe.email, role: nextMe.role }, true)
				}
			}

			const userId = nextMe?.id ?? user?.id
			if (!userId) throw new Error('Missing user id')

			// Ensure a linked contact exists (1:1) so phone/company/address can be saved.
			let nextContact = contact
			if (!nextContact) {
				nextContact = await api.post<Contact>('/contacts', {
					name: (nextMe?.name ?? name).trim(),
					email: (nextMe?.email ?? email).trim(),
					phone: phone.trim() ? phone.trim() : undefined,
					companyName: companyName.trim() ? companyName.trim() : undefined,
					address: address.trim() ? address.trim() : undefined,
					userId,
				})
				setContact(nextContact)
			} else {
				const patchPayload = {
					phone: phone.trim() ? phone.trim() : undefined,
					companyName: companyName.trim() ? companyName.trim() : undefined,
					address: address.trim() ? address.trim() : undefined,
				}
				nextContact = await api.patch<Contact>(`/contacts/${nextContact.id}`, patchPayload)
				setContact(nextContact)
			}

			syncForm(nextMe ?? null, nextContact)
			setSuccess('Profile saved')
			setEditMode(false)
		} catch (e: any) {
			setError(e?.message ?? 'Save failed')
		} finally {
			setSaving(false)
		}
	}

	function onCancelEdit() {
		syncForm(me, contact)
		setEditMode(false)
		setError(null)
		setSuccess(null)
	}

	async function onReset() {
		await load()
	}

	async function onChangePassword() {
		setPwSaving(true)
		setPwError(null)
		setPwSuccess(null)
		try {
			if (!pwCurrent) throw new Error('Enter current password')
			if (!pwNew) throw new Error('Enter a new password')
			if (!pwConfirm) throw new Error('Confirm the new password')
			if (pwNew !== pwConfirm) throw new Error('Passwords do not match')

			await api.post('/auth/change-password', {
				currentPassword: pwCurrent,
				newPassword: pwNew,
				confirmNewPassword: pwConfirm,
			})
			setPwCurrent('')
			setPwNew('')
			setPwConfirm('')
			setPwSuccess('Password updated')
		} catch (e: any) {
			setPwError(e?.message ?? 'Password change failed')
		} finally {
			setPwSaving(false)
		}
	}

	return (
		<div className="space-y-4">
			<PageHeader
				title="My Profile"
				subtitle="Update your account details, contact info, and password."
				actions={
					<>
						{editMode ? (
							<>
								<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={onCancelEdit} disabled={loading || saving}>
									Cancel
								</Button>
								<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={onReset} disabled={loading || saving}>
									<Undo2 className="mr-2 size-4" />
									Reset
								</Button>
								<Button onClick={onSave} disabled={loading || saving || !dirty}>
									<Save className="mr-2 size-4" />
									{saving ? 'Saving…' : 'Save'}
								</Button>
							</>
						) : (
							<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => setEditMode(true)} disabled={loading}>
								<Pencil className="mr-2 size-4" />
								Edit
							</Button>
						)}
					</>
				}
			/>

			{error ? (
				<div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
			) : null}
			{success ? (
				<div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</div>
			) : null}
			{loading ? <div className="text-sm text-muted-foreground">Loading…</div> : null}

			<div className="grid gap-4 lg:grid-cols-3">
				<div className="space-y-4 lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Account</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<Label>Name</Label>
									<Input
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Your name"
										readOnly={!editMode}
										className={!editMode ? 'bg-muted/20' : undefined}
									/>
								</div>
								<div>
									<Label>Email</Label>
									<Input
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="name@company.com"
										readOnly={!editMode}
										className={!editMode ? 'bg-muted/20' : undefined}
									/>
								</div>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<Label>Role</Label>
									<Input value={(me?.role ?? user?.role ?? '') as string} readOnly className="bg-muted/20" />
									<div className="mt-1 text-xs text-muted-foreground">Roles control access to internal screens vs portal checkout.</div>
								</div>
								<div>
									<Label>User ID</Label>
									<Input value={effectiveUserId ?? ''} readOnly className="bg-muted/20" />
									<div className="mt-1 text-xs text-muted-foreground">Used to link your Contact record.</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Contact Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<Label>Phone (optional)</Label>
									<Input
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
										placeholder="+91…"
										readOnly={!editMode}
										className={!editMode ? 'bg-muted/20' : undefined}
									/>
								</div>
								<div>
									<Label>Company (optional)</Label>
									<Input
										value={companyName}
										onChange={(e) => setCompanyName(e.target.value)}
										placeholder="Company name"
										readOnly={!editMode}
										className={!editMode ? 'bg-muted/20' : undefined}
									/>
								</div>
							</div>

							<div>
								<Label>Address (optional)</Label>
								<Textarea
									value={address}
									onChange={(e) => setAddress(e.target.value)}
									placeholder="Billing address…"
									readOnly={!editMode}
									className={!editMode ? 'bg-muted/20' : undefined}
								/>
							</div>

							<div className="text-xs text-muted-foreground">
								These fields are stored on your linked Contact record and used for subscriptions/invoices.
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Shield className="size-4" />
								Security
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{pwError ? (
								<div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{pwError}</div>
							) : null}
							{pwSuccess ? (
								<div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{pwSuccess}</div>
							) : null}

							<div className="grid gap-4 md:grid-cols-3">
								<div>
									<Label>Current password</Label>
									<Input type="password" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} />
								</div>
								<div>
									<Label>New password</Label>
									<Input type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} />
								</div>
								<div>
									<Label>Confirm new password</Label>
									<Input type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} />
								</div>
							</div>

							<div className="flex flex-wrap items-center justify-between gap-3">
								<div className="text-xs text-muted-foreground">Requires uppercase + lowercase + special character, and 9+ characters.</div>
								<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={onChangePassword} disabled={pwSaving}>
									{pwSaving ? 'Updating…' : 'Update password'}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Quick Links</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex flex-wrap gap-2">
								<Link to="/app/subscriptions">
									<Button className="bg-muted/30 text-foreground hover:bg-muted/40">My Subscriptions</Button>
								</Link>
								<Link to="/portal/shop">
									<Button className="bg-muted/30 text-foreground hover:bg-muted/40">Portal Shop</Button>
								</Link>
								<Link to="/portal/profile">
									<Button className="bg-muted/30 text-foreground hover:bg-muted/40">Portal Profile</Button>
								</Link>
							</div>
							<div className="text-xs text-muted-foreground">Useful shortcuts for day-to-day subscription work.</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Session</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<Button
								className="w-full bg-muted/30 text-foreground hover:bg-muted/40"
								onClick={() => {
									logout()
									navigate('/login')
								}}
							>
								Sign out
							</Button>
							<div className="text-xs text-muted-foreground">If you changed your email, signing out + signing back in can refresh access.</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
