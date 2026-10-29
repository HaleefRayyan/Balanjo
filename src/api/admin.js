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
