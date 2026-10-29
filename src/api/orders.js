import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "./client"

// items: [{ productId, variant, quantity }]
export const useCreateOrder = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (items) => api("/orders", { method: "POST", body: { items } }).then((data) => data.order),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
    })
}

export const useMyOrders = () =>
    useQuery({
        queryKey: ["orders"],
        queryFn: () => api("/orders").then((data) => data.orders),
    })

export const useCancelOrder = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id) => api(`/orders/${id}/cancel`, { method: "POST" }).then((data) => data.order),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
    })
}
