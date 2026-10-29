import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api, toQuery } from "./client"

// params: { q, category, limit }
export const useBlogs = (params = {}, options = {}) =>
    useQuery({
        queryKey: ["blogs", params],
        queryFn: () => api(`/blogs${toQuery(params)}`).then((data) => data.blogs),
        placeholderData: keepPreviousData,
        ...options,
    })

export const useBlog = (slug) =>
    useQuery({
        queryKey: ["blog", slug],
        queryFn: () => api(`/blogs/${encodeURIComponent(slug)}`).then((data) => data.blog),
    })

// formData: title, category, body, image (opsional)
export const useCreateBlog = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (formData) => api("/blogs", { method: "POST", body: formData }).then((data) => data.blog),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blogs"] }),
    })
}

export const useDeleteBlog = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id) => api(`/blogs/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blogs"] })
            queryClient.invalidateQueries({ queryKey: ["admin", "stats"] })
        },
    })
}
