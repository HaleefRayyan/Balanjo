import logoWhite from "../../../assets/navbar/logoWhite.svg"
import logoCoklat from "../../../assets/navbar/logoCoklat.svg"
import Button from "../../ui/Button"
import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../../context/auth"
import { useCart } from "../../../context/cart"

const navItems = [
    ["Home", "/"],
    ["Forum", "/forum"],
    ["Blog", "/blog"],
    ["E-Commerce", "/e-commerce"],
]

const CartIcon = () => (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="currentColor" aria-hidden="true">
        <path d="M17.007 2.83325C20.8036 2.83325 23.9249 5.81662 24.0833 9.59688H24.0463C24.0508 9.70676 24.0296 9.81618 23.9846 9.91659H24.2058C25.9299 9.91659 27.7353 11.1116 28.4592 13.9963L28.5378 14.3367L29.6271 23.1125C30.411 28.7097 27.3487 31.0636 23.1713 31.1633L22.8912 31.1666H11.1471C6.90168 31.1666 3.63027 29.6196 4.34956 23.4933L4.39861 23.1125L5.50041 14.3367C6.0437 11.2301 7.86761 10.0048 9.625 9.92121L9.81993 9.91659H9.93067C9.912 9.81083 9.912 9.70263 9.93067 9.59688C10.0891 5.81662 13.2104 2.83325 17.007 2.83325ZM12.8874 14.6331C12.1959 14.6331 11.6354 15.21 11.6354 15.9217C11.6354 16.6334 12.1959 17.2104 12.8874 17.2104C13.5789 17.2104 14.1394 16.6334 14.1394 15.9217L14.1297 15.7601C14.0524 15.1247 13.5257 14.6331 12.8874 14.6331ZM21.0882 14.6331C20.3968 14.6331 19.8362 15.21 19.8362 15.9217C19.8362 16.6334 20.3968 17.2104 21.0882 17.2104C21.7797 17.2104 22.3403 16.6334 22.3403 15.9217C22.3403 15.21 21.7797 14.6331 21.0882 14.6331ZM16.9515 4.6783C14.2257 4.6783 12.0159 6.88042 12.0159 9.59688C12.0346 9.70263 12.0346 9.81083 12.0159 9.91659H21.9487C21.9093 9.81451 21.8884 9.70625 21.887 9.59688C21.887 6.88042 19.6773 4.6783 16.9515 4.6783Z" />
    </svg>
)

// overlay: navbar transparan di atas hero sampai halaman discroll (dipakai Home)
const Navbar = ({ overlay = false }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenu, setMobileMenu] = useState({ path: "", open: false });
    const [userMenu, setUserMenu] = useState({ path: "", open: false });
    const location = useLocation()
    const navigate = useNavigate()
    const { user, loading: authLoading, logout } = useAuth()
    const { count: cartCount } = useCart()

    const isTransparent = overlay && !isScrolled
    const isMenuOpen = mobileMenu.open && mobileMenu.path === location.pathname
    const isUserMenuOpen = userMenu.open && userMenu.path === location.pathname
    const navbarTransparent = isTransparent && !isMenuOpen
    const activeLinkClass = navbarTransparent
        ? 'font-semibold text-white border-b-2 border-white'
        : 'font-semibold text-black border-b-2 border-black'

    const toggleMobileMenu = () => {
        setMobileMenu({ path: location.pathname, open: !isMenuOpen })
    }

    const closeMobileMenu = () => {
        setMobileMenu({ path: location.pathname, open: false })
    }

    const toggleUserMenu = () => {
        setUserMenu({ path: location.pathname, open: !isUserMenuOpen })
    }

    const handleLogout = async () => {
        await logout().catch(() => {}) // kalau server tidak bisa dihubungi, tetap kembali ke Home
        navigate("/")
    }

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 w-full z-40 transition-colors duration-300
                ${navbarTransparent ? 'bg-transparent' : 'bg-white shadow-md'}`}
        >
            <nav className="flex h-20 w-full items-center justify-between px-5 sm:px-8 lg:h-33 lg:px-14.75">
                <div className="flex items-center gap-6 lg:gap-30">
                    <Link to="/">
                        <img src={navbarTransparent ? logoWhite : logoCoklat} alt="logo" />
                    </Link>
                    <ul
                        onClick={closeMobileMenu}
                        className={`fixed left-0 right-0 top-20 z-50 flex h-auto w-full flex-col items-start gap-5 border-t border-gray-100 bg-white px-5 py-6 text-[18px] font-medium shadow-xl transition-[transform,opacity] duration-300 ease-out sm:px-8 lg:static lg:h-auto lg:w-91.25 lg:flex-row lg:items-center lg:justify-between lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:transition-none lg:pointer-events-auto lg:translate-y-0 lg:opacity-100
                            ${isMenuOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0'}
                            ${navbarTransparent ? 'text-black lg:text-white' : 'text-black lg:text-black'}`}
                    >
                        {navItems.map(([label, path]) => (
                            <li key={path}>
                                <NavLink end={path === "/"} className={({ isActive }) => isActive ? activeLinkClass : undefined} to={path}>{label}</NavLink>
                            </li>
                        ))}
                        <li className="lg:hidden">
                            <NavLink className={({ isActive }) => isActive ? activeLinkClass : undefined} to="/cart">Keranjang ({cartCount})</NavLink>
                        </li>
                        {user ? (
                            <>
                                <li className="mt-2 border-t border-gray-200 pt-5 lg:hidden">
                                    <span className="text-button">{user.name}</span>
                                </li>
                                <li className="lg:hidden"><Link to="/orders">Pesanan Saya</Link></li>
                                <li className="lg:hidden"><Link to="/seller">Toko Saya</Link></li>
                                {user.role === "admin" && (
                                    <li className="lg:hidden"><Link to="/admin">Admin Panel</Link></li>
                                )}
                                <li className="lg:hidden">
                                    <button type="button" className="inline-flex rounded-md bg-button px-4 py-2 text-sm text-white" onClick={handleLogout}>Logout</button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="mt-2 border-t border-gray-200 pt-5 lg:hidden">
                                    <NavLink className={({ isActive }) => isActive ? 'font-semibold text-button' : 'text-button'} to="/login">Log in</NavLink>
                                </li>
                                <li className="lg:hidden">
                                    <Link className="inline-flex rounded-md bg-button px-4 py-2 text-sm text-white" to="/register">Sign up</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
                <div className="hidden items-center gap-6 lg:flex lg:gap-20">
                    <Link
                        to="/cart"
                        aria-label={`Keranjang, ${cartCount} item`}
                        className={`relative ${navbarTransparent ? 'text-white' : 'text-black'}`}
                    >
                        <CartIcon />
                        <span className="absolute -right-2.5 -top-1 flex h-5.5 min-w-5.5 items-center justify-center rounded-full bg-button px-1 text-[12px] font-medium text-white">
                            {cartCount > 99 ? "99+" : cartCount}
                        </span>
                    </Link>
                    {authLoading ? (
                        <div className="h-15 w-40" aria-hidden="true" />
                    ) : user ? (
                        <div className="relative">
                            <button
                                type="button"
                                aria-expanded={isUserMenuOpen}
                                onClick={toggleUserMenu}
                                className={`flex items-center gap-5 text-[18px] ${navbarTransparent ? 'text-white' : 'text-black'}`}
                            >
                                <span>{user.name}</span>
                                <span className="flex h-15 w-15 items-center justify-center rounded-full bg-[#64708A] text-[20px] text-white">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                                <svg className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                    <path d="M3 6l5 5 5-5" />
                                </svg>
                            </button>
                            {isUserMenuOpen && (
                                <div className="absolute right-0 top-full mt-3 w-44 rounded-lg bg-white py-2 shadow-lg">
                                    <Link to="/orders" className="block px-4 py-2 text-[16px] text-black hover:bg-background">Pesanan Saya</Link>
                                    <Link to="/seller" className="block px-4 py-2 text-[16px] text-black hover:bg-background">Toko Saya</Link>
                                    {user.role === "admin" && (
                                        <Link to="/admin" className="block px-4 py-2 text-[16px] text-black hover:bg-background">Admin Panel</Link>
                                    )}
                                    <button type="button" onClick={handleLogout} className="w-full px-4 py-2 text-left text-[16px] text-black hover:bg-background">
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex justify-center items-center gap-5">
                            <Link to="/login"
                                className={`text-[18px] font-normal transition-colors duration-300
                                    ${navbarTransparent ? 'text-white' : 'text-button'}`}
                            >
                                Log in
                            </Link>
                            <Button onClick={() => navigate("/register")} className="w-29.75 h-12.25">Sign up</Button>
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    aria-label="Buka menu navigasi"
                    aria-expanded={isMenuOpen}
                    onClick={toggleMobileMenu}
                    className={`relative z-60 flex h-10 w-10 flex-col items-center justify-center rounded-md text-black lg:hidden`}
                >
                    <span className={`absolute h-0.5 w-6 bg-current transition-transform duration-300 ${isMenuOpen ? 'rotate-45' : '-translate-y-2'}`} />
                    <span className={`absolute h-0.5 w-6 bg-current transition-opacity duration-200 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                    <span className={`absolute h-0.5 w-6 bg-current transition-transform duration-300 ${isMenuOpen ? '-rotate-45' : 'translate-y-2'}`} />
                </button>
            </nav>
        </header>
    );
}

export default Navbar
