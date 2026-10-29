import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "./client"

export const fetchMe = () => api("/auth/me").then((data) => data.user)
export const loginRequest = (credentials) => api("/auth/login", { method: "POST", body: credentials }).then((data) => data.user)
export const registerRequest = (data) => api("/auth/register", { method: "POST", body: data }).then((result) => result.user)
export const logoutRequest = () => api("/auth/logout", { method: "POST" })

// Profil: hasilnya langsung menggantikan data user yang sedang login (navbar ikut berubah).
// Konten lain (blog, forum) dimuat ulang karena menampilkan nama & foto penulis.
const useProfileMutation = (mutationFn) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input) => mutationFn(input).then((data) => data.user),
        onSuccess: (user) => {
            queryClient.setQueryData(["me"], user)
            queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] !== "me" })
        },
    })
}

export const useUpdateProfile = () => useProfileMutation((data) => api("/auth/me", { method: "PATCH", body: data }))

// formData: image
export const useUploadAvatar = () => useProfileMutation((formData) => api("/auth/me/avatar", { method: "PUT", body: formData }))

export const useRemoveAvatar = () => useProfileMutation(() => api("/auth/me/avatar", { method: "DELETE" }))

export const useChangePassword = () =>
    useMutation({ mutationFn: (data) => api("/auth/change-password", { method: "POST", body: data }) })

export const useForgotPassword = () =>
    useMutation({ mutationFn: (email) => api("/auth/forgot-password", { method: "POST", body: { email } }) })

export const useResetPassword = () =>
    useMutation({ mutationFn: (data) => api("/auth/reset-password", { method: "POST", body: data }) })
