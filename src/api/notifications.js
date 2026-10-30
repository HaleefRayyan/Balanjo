import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "./client"

// { notifications, unread } — dicek ulang tiap menit selama halaman terbuka
export const useNotifications = (enabled) =>
    useQuery({
        queryKey: ["notifications"],
        queryFn: () => api("/notifications"),
        enabled,
        refetchInterval: 60_000,
    })

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id) => api(`/notifications/${id}/read`, { method: "POST" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    })
}

export const useMarkAllNotificationsRead = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () => api("/notifications/read-all", { method: "POST" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    })
}
