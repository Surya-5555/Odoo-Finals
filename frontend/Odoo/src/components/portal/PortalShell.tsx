import * as React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ShoppingCart, User } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'

type NavItem = { to: string; label: string }

const NAV: NavItem[] = [
	{ to: '/portal/home', label: 'Home' },
	{ to: '/portal/shop', label: 'Shop' },
]

export function PortalShell() {
	const navigate = useNavigate()
	const { user, logout } = useAuth()
	const { count } = useCart()
	const [isAccountOpen, setIsAccountOpen] = React.useState(false)
	const accountMenuRef = React.useRef<HTMLDivElement | null>(null)

	const doLogout = React.useCallback(() => {
		logout()
		setIsAccountOpen(false)
		navigate('/login', { replace: true })
		// Fallback: ensure route change even if something intercepts navigation.
		setTimeout(() => {
			if (window.location.pathname !== '/login') window.location.assign('/login')
		}, 0)
	}, [logout, navigate])

	React.useEffect(() => {
		const onPointerDown = (ev: MouseEvent | TouchEvent) => {
			if (!isAccountOpen) return
			const target = ev.target as Node | null
			if (!target) return
			if (accountMenuRef.current && !accountMenuRef.current.contains(target)) {
				setIsAccountOpen(false)
			}
		}
		document.addEventListener('mousedown', onPointerDown)
		document.addEventListener('touchstart', onPointerDown)
		return () => {
			document.removeEventListener('mousedown', onPointerDown)
			document.removeEventListener('touchstart', onPointerDown)
		}
	}, [isAccountOpen])

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="pointer-events-none fixed inset-0 print:hidden bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(circle_at_85%_25%,rgba(168,85,247,0.14),transparent_40%),radial-gradient(circle_at_35%_90%,rgba(16,185,129,0.10),transparent_45%)]" />

			<header className="relative z-20 border-b border-border/60 bg-background/70 backdrop-blur-xl print:hidden">
				<div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="grid size-10 place-items-center rounded-2xl bg-primary/15 text-primary border border-primary/20">
							<span className="font-handwriting text-lg">O</span>
						</div>
						<div>
							<div className="text-sm font-semibold tracking-tight">Odoo Subscriptions</div>
							<div className="text-xs text-muted-foreground">For portal/external users</div>
						</div>
					</div>

					<nav className="flex flex-wrap items-center gap-2">
						{NAV.map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								className={({ isActive }) =>
									cn(
										'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
										isActive
											? 'bg-primary/15 text-foreground border border-primary/20'
											: 'text-muted-foreground hover:text-foreground hover:bg-muted/15 border border-transparent',
									)
								}
							>
								<span>{item.label}</span>
							</NavLink>
						))}

						<div className="relative" ref={accountMenuRef}>
							<button
								type="button"
								className={cn(
									'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
									location.pathname.startsWith('/portal/account') || location.pathname.startsWith('/portal/orders')
										? 'bg-primary/15 text-foreground border border-primary/20'
										: 'text-muted-foreground hover:text-foreground hover:bg-muted/15 border border-transparent',
								)}
								onClick={() => setIsAccountOpen((v) => !v)}
								aria-expanded={isAccountOpen}
								aria-haspopup="menu"
							>
								My Account
							</button>

							{isAccountOpen ? (
								<div
									className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-background shadow-lg"
									role="menu"
									onKeyDown={(e) => {
										if (e.key === 'Escape') setIsAccountOpen(false)
									}}
								>
									<button
										type="button"
										className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/30"
										onClick={() => {
											setIsAccountOpen(false)
											navigate('/portal/account/user-details')
										}}
									>
										<User className="size-4" />
										User details
									</button>
									<button
										type="button"
										className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/30"
										onClick={() => {
											setIsAccountOpen(false)
											navigate('/portal/orders')
										}}
									>
										My orders
									</button>
									<div className="border-t border-border/60" />
									<button
										type="button"
										className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/30"
										onClick={() => {
											doLogout()
										}}
									>
										Logout
									</button>
								</div>
							) : null}
						</div>
					</nav>

					<div className="flex items-center gap-2">
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => navigate('/portal/cart')}>
							<ShoppingCart className="mr-2 size-4" />
							Cart {count ? `(${count})` : ''}
						</Button>
						<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => navigate('/portal/account/user-details')}>
							My profile
						</Button>
					</div>
				</div>
			</header>

			<main className="relative mx-auto max-w-6xl px-6 py-8">
				{user?.role !== 'PORTAL' ? (
					<div className="rounded-2xl border border-border bg-card p-6">
						<div className="text-lg font-semibold">Portal is for external users</div>
						<div className="mt-1 text-sm text-muted-foreground">Your account does not have PORTAL access.</div>
						<div className="mt-4 flex flex-wrap gap-2">
							<Button className="bg-muted/30 text-foreground hover:bg-muted/40" onClick={() => navigate('/app/overview')}>
								Go to Dashboard
							</Button>
							<Button
								className="bg-muted/30 text-foreground hover:bg-muted/40"
								onClick={() => {
									doLogout()
								}}
							>
								Sign out
							</Button>
						</div>
					</div>
				) : (
					<>
						<div className="mb-6">
							<div className="text-xs text-muted-foreground">Signed in as</div>
							<div className="text-sm font-medium truncate">{user?.email ?? '—'}</div>
						</div>
						<Outlet />
					</>
				)}
			</main>
		</div>
	)
}
