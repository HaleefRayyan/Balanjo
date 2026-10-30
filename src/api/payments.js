import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "./client"
import { loadSnap, openSnap } from "../utils/snap"

let paymentConfig = null
const fetchPaymentConfig = async () => (paymentConfig ??= await api("/payments/config"))

// Bayar pesanan lewat popup Midtrans, lalu cek statusnya ke server.
// Hasil: { order, result } — result dari popup ("success" | "pending" | "error" | "closed")
export const usePayOrder = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (orderId) => {
            const config = await fetchPaymentConfig()
            const { token } = await api(`/orders/${orderId}/pay`, { method: "POST" })
            const snap = await loadSnap(config)
            const result = await openSnap(snap, token)
            const { order } = await api(`/orders/${orderId}/refresh-payment`, { method: "POST" })
            return { order, result }
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
    })
}
