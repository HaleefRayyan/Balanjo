import { useMutation } from "@tanstack/react-query"
import { api } from "./client"

export const fetchMe = () => api("/auth/me").then((data) => data.user)
export const loginRequest = (credentials) => api("/auth/login", { method: "POST", body: credentials }).then((data) => data.user)
export const registerRequest = (data) => api("/auth/register", { method: "POST", body: data }).then((result) => result.user)
export const logoutRequest = () => api("/auth/logout", { method: "POST" })

export const useChangePassword = () =>
    useMutation({ mutationFn: (data) => api("/auth/change-password", { method: "POST", body: data }) })

export const useForgotPassword = () =>
    useMutation({ mutationFn: (email) => api("/auth/forgot-password", { method: "POST", body: { email } }) })

export const useResetPassword = () =>
    useMutation({ mutationFn: (data) => api("/auth/reset-password", { method: "POST", body: data }) })
