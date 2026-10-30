import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "./client"

export const useAdminStats = () =>
    useQuery({
        queryKey: ["admin", "stats"],
        queryFn: () => api("/admin/stats").then((data) => data.stats),
    })

export const useAdminUsers = () =>
    useQuery({
        queryKey: ["admin", "users"],
        queryFn: () => api("/admin/users").then((data) => data.users),
    })

export const useDeleteUser = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id) => api(`/admin/users/${id}`, { method: "DELETE" }),
        // konten milik user ikut terhapus di server
        onSuccess: () => queryClient.invalidateQueries(),
    })
}

// ---------- Payout seller ----------

export const useAdminPayouts = (status) =>
    useQuery({
        queryKey: ["admin", "payouts", status ?? "all"],
        queryFn: () => api(`/admin/payouts${status ? `?status=${status}` : ""}`).then((data) => data.payouts),
    })

export const usePayoutSellerSummary = (id) =>
    useQuery({
        queryKey: ["admin", "payout-summary", id],
        queryFn: () => api(`/admin/payouts/${id}/seller-summary`).then((data) => data.summary),
        enabled: Boolean(id),
    })

// { id, status: "PAID" | "REJECTED", note }
export const useProcessPayout = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, status, note }) => api(`/admin/payouts/${id}`, { method: "PATCH", body: { status, note } }).then((data) => data.payout),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin"] }),
    })
}
