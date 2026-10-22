import logoWhite from "../../../assets/navbar/logoWhite.svg"
import logoCoklat from "../../../assets/navbar/logoCoklat.svg"
import belanjaWhite from "../../../assets/navbar/belanjaWhite.svg"
import belanjaBlack from "../../../assets/navbar/belanjaBlack.svg"
import Button from "../../ui/Button"
import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../../context/auth"

const navItems = [
    ["Home", "/"],
    ["Forum", "/forum"],
    ["Blog", "/blog"],
    ["E-Commerce", "/e-commerce"],
]

// overlay: navbar transparan di atas hero sampai halaman discroll (dipakai Home)
const Navbar = ({ overlay = false }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenu, setMobileMenu] = useState({ path: "", open: false });
    const [userMenu, setUserMenu] = useState({ path: "", open: false });
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuth()

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

    const handleLogout = () => {
        logout()
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
                        {user ? (
                            <>
                                <li className="mt-2 border-t border-gray-200 pt-5 lg:hidden">
                                    <span className="text-button">{user.name}</span>
                                </li>
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
                    <Link to="/e-commerce" aria-label="Buka E-Commerce">
                        <img src={navbarTransparent ? belanjaWhite : belanjaBlack} alt="" />
                    </Link>
                    {user ? (
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
