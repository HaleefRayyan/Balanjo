import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "../components/admin/Sidebar"
import Topbar from "../components/admin/Topbar"
import { useAuth } from "../context/auth"

const AdminLayout = () => {
    const location = useLocation()
    const { logout } = useAuth()
    // sidebar mobile otomatis tertutup saat pindah halaman
    const [sidebar, setSidebar] = useState({ path: "", open: false })
    const sidebarOpen = sidebar.open && sidebar.path === location.pathname

    const handleLogout = () => logout("/login")

    return (
        <div className="min-h-screen bg-background">
            <Sidebar open={sidebarOpen} onLogout={handleLogout} />
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/30 lg:hidden"
                    onClick={() => setSidebar({ path: location.pathname, open: false })}
                />
            )}

            <div className="lg:pl-75">
                <Topbar onMenuClick={() => setSidebar({ path: location.pathname, open: true })} />
                <main className="px-5 py-10 sm:px-8 lg:px-14 lg:py-16">
                    <div className="mx-auto max-w-300">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
