import { useState } from "react"
import { CartContext } from "./cart"
import { readJSON, writeJSON } from "../utils/storage"

const STORAGE_KEY = "balanjo:cart"
const MAX_QUANTITY = 99

// Keranjang disimpan di browser sebagai { key, productId, variant, quantity }.
// Nama & harga diambil dari API di halaman keranjang; harga final dihitung server saat checkout.
const CartProvider = ({ children }) => {
    const [items, setItems] = useState(() => readJSON(STORAGE_KEY, []))

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

    // buang item yang produknya sudah tidak ada di server
    const removeProducts = (productIds) => update((current) => current.filter((item) => !productIds.includes(item.productId)))

    const clear = () => update(() => [])

    const count = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <CartContext.Provider value={{ items, count, addItem, setQuantity, removeItem, removeProducts, clear }}>
            {children}
        </CartContext.Provider>
    )
}

export default CartProvider
