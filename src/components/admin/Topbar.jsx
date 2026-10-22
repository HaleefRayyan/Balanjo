import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronDownIcon, MenuIcon } from "./icons"

const Topbar = ({ onMenuClick }) => {
    const location = useLocation()
    const [menu, setMenu] = useState({ path: "", open: false })
    const isOpen = menu.open && menu.path === location.pathname

    return (
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-white px-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:px-8 lg:h-28 lg:justify-end lg:px-14">
            <button type="button" aria-label="Buka menu admin" className="cursor-pointer text-black lg:hidden" onClick={onMenuClick}>
                <MenuIcon />
            </button>

            <div className="relative">
                <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setMenu({ path: location.pathname, open: !isOpen })}
                    className="flex cursor-pointer items-center gap-4"
                >
                    <span className="rounded-full bg-button px-6 py-1 text-[16px] font-medium text-white">ADMIN</span>
                    <ChevronDownIcon className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                    <div className="absolute right-0 top-full mt-3 w-44 rounded-lg bg-[#F1F1F1] py-1 shadow-md">
                        <Link to="/admin/password" className="block px-4 py-2 text-[16px] text-[#333] hover:text-button">
                            Ganti Password
                        </Link>
                        <Link to="/" className="block px-4 py-2 text-[16px] text-[#333] hover:text-button">
                            Lihat Website
                        </Link>
                    </div>
                )}
            </div>
        </header>
    )
}

export default Topbar
