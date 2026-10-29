import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../context/auth"

const ProtectedRoute = ({ role }) => {
    const { user, loading } = useAuth()
    const location = useLocation()

    // tunggu jawaban /api/auth/me dulu supaya user yang sudah login tidak terlempar ke /login
    if (loading) return null
    if (!user) return <Navigate to="/login" replace state={{ from: location }} />
    if (role && user.role !== role) return <Navigate to="/" replace />

    return <Outlet />
}

export default ProtectedRoute
