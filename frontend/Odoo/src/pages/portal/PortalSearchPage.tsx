import { Link } from 'react-router-dom'

export function PortalSearchPage() {
	return (
		<div className="space-y-3">
			<div className="text-2xl font-semibold tracking-tight">Search</div>
			<div className="text-sm text-muted-foreground">
				Use <Link className="underline" to="/portal/shop">Shop</Link> to search and sort products.
			</div>
		</div>
	)
}
