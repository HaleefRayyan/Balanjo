import { api } from "./client"

// Keranjang user yang login (server). items: [{ productId, variant, quantity }]
export const fetchCart = () => api("/cart").then((data) => data.items)
export const saveCart = (items, { keepalive } = {}) => api("/cart", { method: "PUT", body: { items }, keepalive }).then((data) => data.items)
