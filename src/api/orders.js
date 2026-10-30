import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "./client"

// { items: [{ productId, variant, quantity }], delivery: { method, recipientName, phone, address, note } }
export const useCreateOrder = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload) => api("/orders", { method: "POST", body: payload }).then((data) => data.order),
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
