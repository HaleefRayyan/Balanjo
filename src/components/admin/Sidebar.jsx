import { Link, NavLink } from "react-router-dom"
import logoCoklat from "../../assets/navbar/logoCoklat.svg"
import { DashboardIcon, FolderGearIcon, UserIcon } from "../ui/icons"

const menu = [
    { label: "Dashboard", to: "/admin", icon: DashboardIcon, end: true },
    { label: "Kelola User", to: "/admin/users", icon: UserIcon },
    { label: "Kelola Blog", to: "/admin/blogs", icon: FolderGearIcon },
    { label: "Kelola Forum", to: "/admin/forums", icon: FolderGearIcon },
    {
        label: "Kelola E-Commerce",
        to: "/admin/e-commerce",
        icon: FolderGearIcon,
        children: [{ label: "Requested Banner", to: "/admin/e-commerce/requests" }],
    },
]

const Sidebar = ({ open, onLogout }) => {
    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 flex w-75 flex-col bg-white shadow-[2px_0_12px_rgba(0,0,0,0.04)] transition-transform duration-300 lg:translate-x-0
                ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
            <Link to="/admin" className="mx-auto mt-10 mb-16 block w-20">
                <img src={logoCoklat} alt="Balanjo" className="w-full" />
            </Link>

            <nav className="flex-1 overflow-y-auto" aria-label="Menu admin">
                <ul className="space-y-2">
                    {menu.map(({ label, to, icon: Icon, end, children }) => (
                        <li key={to}>
                            <NavLink
                                to={to}
                                end={end}
                                className={({ isActive }) => `relative flex items-center gap-6 py-3 pl-11 pr-4 text-[20px] transition-colors
                                    ${isActive ? "text-button before:absolute before:inset-y-1 before:left-0 before:w-1 before:rounded-r before:bg-button" : "text-abu hover:text-button"}`}
                            >
                                <Icon className="h-7 w-7 shrink-0" />
                                {label}
                            </NavLink>
                            {children && (
                                <ul className="mt-1">
                                    {children.map((child) => (
                                        <li key={child.to}>
                                            <NavLink
                                                to={child.to}
                                                className={({ isActive }) => `flex items-center gap-3 py-2 pl-24 pr-4 text-[18px] transition-colors
                                                    ${isActive ? "text-button" : "text-abu hover:text-button"}`}
                                            >
                                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                {child.label}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="px-11 py-10">
                <button
                    type="button"
                    onClick={onLogout}
                    className="cursor-pointer rounded-md bg-button px-6 py-1.5 text-[20px] font-medium text-white transition-colors hover:bg-[#896d26]"
                >
                    Logout
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
