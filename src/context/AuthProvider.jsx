import { useQuery, useQueryClient } from "@tanstack/react-query"
import { AuthContext } from "./auth"
import { fetchMe, loginRequest, logoutRequest, registerRequest } from "../api/auth"

// Sesi login disimpan server di cookie httpOnly; di sini hanya membaca /api/auth/me.
const AuthProvider = ({ children }) => {
    const queryClient = useQueryClient()
    const { data: user, isPending } = useQuery({
        queryKey: ["me"],
        queryFn: fetchMe,
        staleTime: Infinity,
        retry: false,
    })

    const setUser = (nextUser) => queryClient.setQueryData(["me"], nextUser)

    const login = async (credentials) => {
        const nextUser = await loginRequest(credentials)
        setUser(nextUser)
        return nextUser
    }

    const register = async (data) => {
        const nextUser = await registerRequest(data)
        setUser(nextUser)
        return nextUser
    }

    // Muat ulang penuh ke `redirectTo` setelah logout: semua data pribadi di cache ikut hilang, dan
    // halaman yang dilindungi (mis. /profile) tidak sempat mengalihkan ke /login lebih dulu.
    const logout = async (redirectTo = "/") => {
        await logoutRequest().catch(() => {}) // server tidak bisa dihubungi: tetap pindah halaman
        window.location.assign(redirectTo)
    }

    return (
        <AuthContext.Provider value={{ user: user ?? null, loading: isPending, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider
