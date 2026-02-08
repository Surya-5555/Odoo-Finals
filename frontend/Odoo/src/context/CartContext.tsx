import * as React from 'react'

export type CartItem = {
	productId: number
	name: string
	unitPrice: number
	quantity: number
}

type CartContextValue = {
	items: CartItem[]
	count: number
	subtotal: number
	addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
	setQuantity: (productId: number, quantity: number) => void
	removeItem: (productId: number) => void
	clear: () => void
}

const CartContext = React.createContext<CartContextValue | null>(null)

const CART_KEY = 'odoo_portal_cart'

function safeRead(): CartItem[] {
	try {
		const raw = localStorage.getItem(CART_KEY)
		if (!raw) return []
		const parsed = JSON.parse(raw) as unknown
		if (!Array.isArray(parsed)) return []
		return parsed
			.map((x: any) => ({
				productId: Number(x.productId),
				name: String(x.name ?? ''),
				unitPrice: Number(x.unitPrice ?? 0),
				quantity: Number(x.quantity ?? 0),
			}))
			.filter((x) => Number.isFinite(x.productId) && x.productId > 0 && x.quantity > 0)
	} catch {
		return []
	}
}

function write(items: CartItem[]) {
	try {
		localStorage.setItem(CART_KEY, JSON.stringify(items))
	} catch {
		// ignore
	}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = React.useState<CartItem[]>(() => safeRead())

	React.useEffect(() => {
		write(items)
	}, [items])

	const addItem = React.useCallback(
		(item: Omit<CartItem, 'quantity'>, quantity = 1) => {
			setItems((prev) => {
				const existing = prev.find((p) => p.productId === item.productId)
				if (existing) {
					return prev.map((p) =>
						p.productId === item.productId ? { ...p, quantity: p.quantity + quantity } : p,
					)
				}
				return [...prev, { ...item, quantity }]
			})
		},
		[],
	)

	const setQuantity = React.useCallback((productId: number, quantity: number) => {
		setItems((prev) => {
			if (quantity <= 0) return prev.filter((p) => p.productId !== productId)
			return prev.map((p) => (p.productId === productId ? { ...p, quantity } : p))
		})
	}, [])

	const removeItem = React.useCallback((productId: number) => {
		setItems((prev) => prev.filter((p) => p.productId !== productId))
	}, [])

	const clear = React.useCallback(() => setItems([]), [])

	const subtotal = React.useMemo(() => items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0), [items])
	const count = React.useMemo(() => items.reduce((sum, it) => sum + it.quantity, 0), [items])

	const value = React.useMemo<CartContextValue>(
		() => ({ items, subtotal, count, addItem, setQuantity, removeItem, clear }),
		[items, subtotal, count, addItem, setQuantity, removeItem, clear],
	)

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
	const ctx = React.useContext(CartContext)
	if (!ctx) throw new Error('useCart must be used within CartProvider')
	return ctx
}
