import { useState } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import logoCoklat from "../../../assets/navbar/logoCoklat.svg"
import { MenuIcon } from "../../ui/icons"
import UserMenu from "../UserMenu"

// Kerangka panel (Seller Centre, Profil): topbar putih + sidebar kiri + konten abu-abu.
// menu: [{ label, to, icon?, end? }]
// activeStyle: "bar" = teks emas + garis kiri (Seller Centre), "bold" = teks hitam tebal (Profil)
const PanelLayout = ({ menu, menuLabel, topbarLeft, sidebarHeader, sidebarFooter, activeStyle = "bar", homeLink = "/" }) => {
    const location = useLocation()
    // sidebar mobile otomatis tertutup saat pindah halaman
    const [sidebar, setSidebar] = useState({ path: "", open: false })
    const sidebarOpen = sidebar.open && sidebar.path === location.pathname

    const linkClass = (isActive) => activeStyle === "bold"
        ? `block py-2 pl-12 pr-4 text-[15px] transition-colors ${isActive ? "font-semibold text-black" : "text-abu hover:text-black"}`
        : `relative flex items-center gap-4 py-2.5 pl-9 pr-4 text-[15px] transition-colors
            ${isActive ? "text-button before:absolute before:inset-y-1 before:left-0 before:w-1 before:rounded-r before:bg-button" : "text-abu hover:text-button"}`

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-30 flex h-18 items-center justify-between gap-4 bg-white px-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:px-8">
                <div className="flex items-center gap-4">
                    <button type="button" aria-label={`Buka ${menuLabel}`} className="cursor-pointer text-black lg:hidden" onClick={() => setSidebar({ path: location.pathname, open: true })}>
                        <MenuIcon />
                    </button>
                    <Link to={homeLink} className="block w-9">
                        <img src={logoCoklat} alt="Balanjo" className="w-full" />
                    </Link>
                    {topbarLeft}
                </div>
                <UserMenu />
            </header>

            <aside
                className={`fixed bottom-0 left-0 top-0 z-40 flex w-60 flex-col bg-white pt-8 transition-transform duration-300 lg:top-18 lg:z-20 lg:translate-x-0 lg:pt-8
                    ${sidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"}`}
            >
                {sidebarHeader}
                <nav className="flex-1 overflow-y-auto" aria-label={menuLabel}>
                    <ul className="space-y-1">
                        {menu.map(({ label, to, icon: Icon, end, badge }) => (
                            <li key={to}>
                                <NavLink to={to} end={end} className={({ isActive }) => linkClass(isActive)}>
                                    {Icon && <Icon className="h-5 w-5 shrink-0" />}
                                    {label}
                                    {badge > 0 && (
                                        <span className="ml-auto mr-4 min-w-5 rounded-full bg-red-600 px-1.5 text-center text-xs font-semibold leading-5 text-white" aria-label={`${badge} baru`}>
                                            {badge > 99 ? "99+" : badge}
                                        </span>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                {sidebarFooter}
            </aside>
            {sidebarOpen && (
                <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebar({ path: location.pathname, open: false })} />
            )}

            <main className="px-5 py-8 sm:px-8 lg:ml-60 lg:px-10 lg:py-10">
                <div className="mx-auto max-w-300">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default PanelLayout
