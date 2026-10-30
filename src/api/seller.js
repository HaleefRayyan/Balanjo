import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "./client"

// { revenue, orders, toProcess } untuk Dashboard Seller Centre & badge pesanan baru
export const useSellerStats = (options = {}) =>
    useQuery({
        queryKey: ["seller", "stats"],
        queryFn: () => api("/seller/stats").then((data) => data.stats),
        ...options,
    })

// ---------- Produk milik seller ----------

export const useMyProducts = () =>
    useQuery({
        queryKey: ["seller", "products"],
        queryFn: () => api("/seller/products").then((data) => data.products),
    })

// id ada -> edit, tidak ada -> tambah (formData: name, category, price, description, variants, image)
export const useSaveProduct = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, formData }) =>
            api(id ? `/seller/products/${id}` : "/seller/products", { method: id ? "PUT" : "POST", body: formData }).then((data) => data.product),
        onSuccess: (product) => {
            queryClient.invalidateQueries({ queryKey: ["seller", "products"] })
            queryClient.invalidateQueries({ queryKey: ["products"] })
            queryClient.setQueryData(["product", String(product.id)], product)
        },
    })
}

export const useDeleteProduct = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id) => api(`/seller/products/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seller"] })
            queryClient.invalidateQueries({ queryKey: ["products"] })
            queryClient.invalidateQueries({ queryKey: ["banners"] })
        },
    })
}

// ---------- Pesanan masuk ----------

// [{ orderId, createdAt, buyer: { name, email }, items: [...] }]
export const useSellerOrders = () =>
    useQuery({
        queryKey: ["seller", "orders"],
        queryFn: () => api("/seller/orders").then((data) => data.orders),
    })

export const useUpdateOrderItemStatus = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, status }) => api(`/seller/order-items/${id}`, { method: "PATCH", body: { status } }).then((data) => data.item),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seller"] }),
    })
}

// ---------- Pengajuan banner ----------

export const useMyBannerRequests = () =>
    useQuery({
        queryKey: ["seller", "banner-requests"],
        queryFn: () => api("/seller/banner-requests").then((data) => data.requests),
    })

// formData: productId, image
export const useCreateBannerRequest = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (formData) => api("/banners/requests", { method: "POST", body: formData }).then((data) => data.request),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seller", "banner-requests"] }),
    })
}

// ---------- Penghasilan & payout ----------

// { summary, account, payouts, entries }
export const useSellerPayouts = () =>
    useQuery({
        queryKey: ["seller", "payouts"],
        queryFn: () => api("/seller/payouts"),
    })

export const useSavePayoutAccount = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (account) => api("/seller/payout-account", { method: "PUT", body: account }).then((data) => data.account),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seller", "payouts"] }),
    })
}

export const useRequestPayout = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (amount) => api("/seller/payouts", { method: "POST", body: { amount } }).then((data) => data.payout),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seller", "payouts"] }),
    })
}
