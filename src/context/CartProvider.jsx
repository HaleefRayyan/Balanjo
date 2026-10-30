import { useEffect, useRef, useState } from "react"
import { CartContext } from "./cart"
import { useAuth } from "./auth"
import { fetchCart, saveCart } from "../api/cart"
import { readJSON, writeJSON } from "../utils/storage"

const STORAGE_KEY = "balanjo:cart"
const MAX_QUANTITY = 99
const SAVE_DELAY = 400

const keyOf = (productId, variant) => `${productId}:${variant ?? ""}`
const withKeys = (items) => items.map((item) => ({ ...item, key: keyOf(item.productId, item.variant) }))
const toPayload = (items) => items.map(({ productId, variant, quantity }) => ({ productId, variant, quantity }))

// Gabung dua keranjang: baris yang sama dijumlah (maks 99)
const mergeCarts = (a, b) => {
    const merged = new Map()
    for (const item of [...a, ...b]) {
        const key = keyOf(item.productId, item.variant)
        const quantity = Math.min(MAX_QUANTITY, (merged.get(key)?.quantity ?? 0) + item.quantity)
        merged.set(key, { key, productId: item.productId, variant: item.variant, quantity })
    }
    return [...merged.values()]
}

// Tamu: keranjang di browser (localStorage).
// Login: keranjang di server (sama di semua perangkat). Keranjang tamu digabung ke akun saat login.
const CartProvider = ({ children }) => {
    const { user, loading } = useAuth()
    const [items, setItems] = useState(() => readJSON(STORAGE_KEY, []))
    const itemsRef = useRef(items)
    const syncedUserId = useRef(null)
    const saveTimer = useRef(null)
    const userId = user?.id ?? null

    // Saat login (atau halaman dibuka dalam keadaan login): ambil keranjang server dan gabungkan
    useEffect(() => {
        if (loading || !userId || syncedUserId.current === userId) return
        syncedUserId.current = userId
        let cancelled = false
        fetchCart()
            .then(async (serverItems) => {
                const local = itemsRef.current
                const merged = local.length ? withKeys(await saveCart(toPayload(mergeCarts(serverItems, local)))) : withKeys(serverItems)
                if (cancelled) return
                writeJSON(STORAGE_KEY, null) // keranjang tamu sekarang tersimpan di akun
                itemsRef.current = merged
                setItems(merged)
            })
            .catch(() => { syncedUserId.current = null }) // coba lagi di render berikutnya
        return () => { cancelled = true }
    }, [userId, loading])

    // Perubahan yang masih menunggu (debounce) langsung dikirim saat tab disembunyikan / ditutup / di-reload
    useEffect(() => {
        const flush = () => {
            if (!saveTimer.current) return
            clearTimeout(saveTimer.current)
            saveTimer.current = null
            saveCart(toPayload(itemsRef.current), { keepalive: true }).catch(() => {})
        }
        const onVisibility = () => { if (document.visibilityState === "hidden") flush() }
        window.addEventListener("pagehide", flush)
        document.addEventListener("visibilitychange", onVisibility)
        return () => {
            window.removeEventListener("pagehide", flush)
            document.removeEventListener("visibilitychange", onVisibility)
            flush()
        }
    }, [])

    const update = (updater) => {
        const next = updater(itemsRef.current)
        itemsRef.current = next
        setItems(next)
        if (userId) {
            // beberapa perubahan cepat (mis. tombol + berkali-kali) dikirim sekali saja
            clearTimeout(saveTimer.current)
            saveTimer.current = setTimeout(() => {
                saveTimer.current = null
                saveCart(toPayload(itemsRef.current)).catch(() => {})
            }, SAVE_DELAY)
        } else {
            writeJSON(STORAGE_KEY, next)
        }
    }

    const addItem = (productId, variant, quantity = 1) => {
        const key = keyOf(productId, variant)
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
