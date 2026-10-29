import { createContext, useContext } from "react"

export const CartContext = createContext(null)

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) throw new Error("useCart harus dipakai di dalam <CartProvider>")
    return context
}
