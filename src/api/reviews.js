import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "./client"

export const useProductReviews = (productId) =>
    useQuery({
        queryKey: ["reviews", String(productId)],
        queryFn: () => api(`/products/${productId}/reviews`).then((data) => data.reviews),
    })

// { orderItemId, rating, comment }
export const useCreateReview = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data) => api("/reviews", { method: "POST", body: data }).then((result) => result.review),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] })
            queryClient.invalidateQueries({ queryKey: ["reviews"] })
            queryClient.invalidateQueries({ queryKey: ["products"] })
            queryClient.invalidateQueries({ queryKey: ["product"] })
        },
    })
}

// dipakai pemilik ulasan dan admin (moderasi)
export const useDeleteReview = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id) => api(`/reviews/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] })
            queryClient.invalidateQueries({ queryKey: ["reviews"] })
            queryClient.invalidateQueries({ queryKey: ["products"] })
            queryClient.invalidateQueries({ queryKey: ["product"] })
            queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] })
        },
    })
}
