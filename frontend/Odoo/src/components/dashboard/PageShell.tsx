import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, CreditCard, FileText, LogOut, Package, PieChart, Repeat, ScrollText, Settings, Tag, Users } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

type NavItem = {
	to: string
	label: string
	icon: React.ReactNode
}

const NAV_COMMON: NavItem[] = [
	{ to: '/app/products', label: 'Products', icon: <Package className="size-4" /> },
	{ to: '/app/contacts', label: 'Contacts', icon: <Users className="size-4" /> },
	{ to: '/app/subscriptions', label: 'Subscriptions', icon: <ScrollText className="size-4" /> },
	{ to: '/app/invoices', label: 'Invoices', icon: <CreditCard className="size-4" /> },
	{ to: '/app/my-profile', label: 'My Profile', icon: <Users className="size-4" /> },
]

const NAV_ADMIN: NavItem[] = [
	...NAV_COMMON,
	{ to: '/app/reporting', label: 'Reporting', icon: <PieChart className="size-4" /> },
]

type NavGroup = {
	label: string
	items: Array<{ to: string; label: string; icon?: React.ReactNode }>
}

const CONFIG_GROUP: NavGroup = {
	label: 'Configuration',
	items: [
		{ to: '/app/recurring-plans', label: 'Recurring Plans', icon: <Repeat className="size-4" /> },
		{ to: '/app/quotation-templates', label: 'Quotation Templates', icon: <FileText className="size-4" /> },
		{ to: '/app/payment-terms', label: 'Payment Terms', icon: <FileText className="size-4" /> },
		{ to: '/app/taxes', label: 'Taxes', icon: <Tag className="size-4" /> },
	],
}

export function PageShell() {
	const { user, logout } = useAuth()
	const location = useLocation()
	const navigate = useNavigate()
	const isAdmin = user?.role === 'ADMIN'

	const isConfigActive = CONFIG_GROUP.items.some((i) => location.pathname.startsWith(i.to)) || location.pathname.startsWith('/app/configuration')

	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="sticky top-0 z-20 border-b border-border/80 bg-background">
				<div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-4 px-4 py-3">
					<button
						className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted/30"
						onClick={() => navigate('/app/subscriptions')}
						type="button"
					>
						<div className="grid size-8 place-items-center rounded-lg bg-primary/15 text-primary border border-primary/20">
							<span className="font-handwriting text-base">O</span>
						</div>
						<div className="leading-tight">
							<div className="text-sm font-semibold tracking-tight">Odoo</div>
							<div className="text-[11px] text-muted-foreground">Subscription</div>
						</div>
					</button>

					<nav className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-1">
						{(isAdmin ? NAV_ADMIN : NAV_COMMON).map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								className={({ isActive }) =>
									cn(
										'inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors',
										isActive
											? 'bg-primary/10 text-foreground border border-primary/20'
											: 'text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent',
									)
								}
							>
								{item.icon}
								<span>{item.label}</span>
							</NavLink>
						))}

						{isAdmin ? (
							<details className="relative">
								<summary
									className={cn(
										'list-none inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors',
										isConfigActive
											? 'bg-primary/10 text-foreground border border-primary/20'
											: 'text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent',
									)}
								>
									<Settings className="size-4" />
									<span>{CONFIG_GROUP.label}</span>
									<ChevronDown className="size-4 opacity-70" />
								</summary>
								<div className="absolute left-0 mt-2 w-64 rounded-xl border border-border bg-background shadow-lg">
									<div className="p-2">
										{CONFIG_GROUP.items.map((i) => (
											<NavLink
												key={i.to}
												to={i.to}
												className={({ isActive }) =>
													cn(
														'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
														isActive
															? 'bg-primary/10 text-foreground'
															: 'text-muted-foreground hover:text-foreground hover:bg-muted/30',
													)
												}
											>
												{i.icon}
												<span>{i.label}</span>
											</NavLink>
										))}
									</div>
								</div>
							</details>
						) : null}
					</nav>

					<div className="flex items-center gap-2">
						<div className="hidden max-w-[260px] truncate text-sm text-muted-foreground sm:block">{user?.email ?? '—'}</div>
						<Button variant="secondary" onClick={() => navigate('/app/subscriptions/new')}>
							New
						</Button>
						<Button
							variant="outline"
							onClick={() => {
								logout()
								navigate('/login')
							}}
						>
							<LogOut className="mr-2 size-4" />
							Logout
						</Button>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-[1400px] p-4">
				<Outlet />
			</main>
		</div>
	)
}

