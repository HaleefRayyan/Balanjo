import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import Avatar from "../../ui/Avatar"
import { ChevronDownIcon } from "../../ui/icons"
import { useAuth } from "../../../context/auth"
import { useSellerStats } from "../../../api/seller"

// Nama + foto + dropdown di topbar Seller Centre & Profil (desain: "Budi (B) ⌄")
const UserMenu = () => {
    const { user, logout } = useAuth()
    const { data: stats } = useSellerStats({ enabled: Boolean(user) })
    const location = useLocation()
    const [menu, setMenu] = useState({ path: "", open: false })
    const isOpen = menu.open && menu.path === location.pathname
    const itemClass = "block w-full px-4 py-2 text-left text-[15px] text-[#333] hover:bg-background hover:text-button"

    if (!user) return null

    return (
        <div className="relative">
            <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setMenu({ path: location.pathname, open: !isOpen })}
                className="flex cursor-pointer items-center gap-3"
            >
                <span className="hidden text-[15px] text-black sm:inline">{user.name}</span>
                <Avatar name={user.name} src={user.avatar} size="h-10 w-10" />
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
                <div className="absolute right-0 top-full z-40 mt-3 w-48 rounded-lg bg-white py-2 shadow-lg">
                    <Link to="/" className={itemClass}>Kembali ke Balanjo</Link>
                    <Link to="/profile" className={itemClass}>Profil Saya</Link>
                    <Link to="/profile/orders" className={itemClass}>Riwayat Pesanan</Link>
                    <Link to="/seller" className={itemClass}>
                        Seller Centre
                        {stats?.toProcess > 0 && <span className="ml-2 rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white">{stats.toProcess}</span>}
                    </Link>
                    {user.role === "admin" && <Link to="/admin" className={itemClass}>Admin Panel</Link>}
                    <button type="button" onClick={() => logout("/")} className={`${itemClass} cursor-pointer`}>Logout</button>
                </div>
            )}
        </div>
    )
}

export default UserMenu
