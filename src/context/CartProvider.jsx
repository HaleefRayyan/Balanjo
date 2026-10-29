import { useState } from "react"
import { CartContext } from "./cart"
import { findProduct } from "../data/products"
import { readJSON, writeJSON } from "../utils/storage"

const STORAGE_KEY = "balanjo:cart"
const MAX_QUANTITY = 99

// Item disimpan sebagai { key, productId, variant, quantity }; detail produk diambil dari data produk.
// Produk yang sudah tidak ada dibuang saat keranjang dibaca.
const readCart = () => readJSON(STORAGE_KEY, []).filter((item) => findProduct(item.productId))

const CartProvider = ({ children }) => {
    const [items, setItems] = useState(readCart)

    const update = (updater) => {
        setItems((current) => {
            const next = updater(current)
            writeJSON(STORAGE_KEY, next)
            return next
        })
    }

    const addItem = (productId, variant, quantity = 1) => {
        const key = `${productId}:${variant ?? ""}`
        update((current) => current.some((item) => item.key === key)
            ? current.map((item) => item.key === key
                ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + quantity) }
                : item)
            : [...current, { key, productId, variant, quantity }])
    }

    const setQuantity = (key, quantity) => {
        update((current) => current.map((item) => item.key === key
            ? { ...item, quantity: Math.max(1, Math.min(MAX_QUANTITY, quantity)) }
            : item))
    }

    const removeItem = (key) => update((current) => current.filter((item) => item.key !== key))

    const clear = () => update(() => [])

    const lines = items.map((item) => ({ ...item, product: findProduct(item.productId) }))
    const count = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0)

    return (
        <CartContext.Provider value={{ lines, count, subtotal, addItem, setQuantity, removeItem, clear }}>
            {children}
        </CartContext.Provider>
    )
}

export default CartProvider
