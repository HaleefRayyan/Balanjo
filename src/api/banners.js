import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "./client"

export const useBanners = () =>
    useQuery({
        queryKey: ["banners"],
        queryFn: () => api("/banners").then((data) => data.banners),
    })

// id ada -> ganti gambar banner itu; tidak ada -> buat banner baru (formData: label, image)
export const useSaveBanner = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, formData }) =>
            api(id ? `/banners/${id}` : "/banners", { method: id ? "PUT" : "POST", body: formData }).then((data) => data.banner),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banners"] }),
    })
}

export const useDeleteBanner = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id) => api(`/banners/${id}`, { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banners"] }),
    })
}

export const useBannerRequests = () =>
    useQuery({
        queryKey: ["banners", "requests"],
        queryFn: () => api("/banners/requests").then((data) => data.requests),
    })

// status: PENDING | APPROVED | REJECTED (disetujui -> otomatis masuk slider)
export const useSetBannerRequestStatus = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, status }) => api(`/banners/requests/${id}`, { method: "PATCH", body: { status } }).then((data) => data.request),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banners"] }),
    })
}
