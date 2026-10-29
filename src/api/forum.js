import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "./client"

// semua diskusi (dengan commentCount); filter kategori & trending dihitung di frontend
export const useForumPosts = () =>
    useQuery({
        queryKey: ["forum"],
        queryFn: () => api("/forum").then((data) => data.posts),
    })

// detail + semua balasan
export const useForumPost = (id) =>
    useQuery({
        queryKey: ["forum", String(id)],
        queryFn: () => api(`/forum/${id}`).then((data) => data.post),
    })

// formData: text, category, image (opsional)
export const useCreateForumPost = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (formData) => api("/forum", { method: "POST", body: formData }).then((data) => data.post),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum"] }),
    })
}

export const useAddComment = (postId) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (text) => api(`/forum/${postId}/comments`, { method: "POST", body: { text } }).then((data) => data.comment),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum"] }),
    })
}

export const useDeleteForumPost = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id) => api(`/forum/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["forum"] })
            queryClient.invalidateQueries({ queryKey: ["admin", "stats"] })
        },
    })
}
