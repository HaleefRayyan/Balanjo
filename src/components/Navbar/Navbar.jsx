import logoWhite from "../../assets/navbar/logoWhite.svg"
import logoCoklat from "../../assets/navbar/logoCoklat.svg"
import belanjaWhite from "../../assets/navbar/belanjaWhite.svg"
import belanjaBlack from "../../assets/navbar/belanjaBlack.svg"
import Button from "../ui/Button"
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom"

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenu, setMobileMenu] = useState({ path: "", open: false });
    const location = useLocation()
    const navigate = useNavigate()

    const alwaysTransparentPages = ["/"]
    const isHomeLike = alwaysTransparentPages.includes(location.pathname)

    // transparan HANYA kalau di halaman home DAN belum discroll
    const isTransparent = isHomeLike && !isScrolled
    const isMenuOpen = mobileMenu.open && mobileMenu.path === location.pathname
    const navbarTransparent = isTransparent && !isMenuOpen
    const isActive = (path) => location.pathname === path
    const activeLinkClass = navbarTransparent
        ? 'font-semibold text-white border-b-2 border-white'
        : 'font-semibold text-black border-b-2 border-black'

    const toggleMobileMenu = () => {
        setMobileMenu({ path: location.pathname, open: !isMenuOpen })
    }

    const closeMobileMenu = () => {
        setMobileMenu({ path: location.pathname, open: false })
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
                        <li><Link className={isActive('/') ? activeLinkClass : undefined} aria-current={isActive('/') ? 'page' : undefined} to="/">Home</Link></li>
                        <li><Link className={isActive('/forum') ? activeLinkClass : undefined} aria-current={isActive('/forum') ? 'page' : undefined} to="/forum">Forum</Link></li>
                        <li><Link className={isActive('/blog') ? activeLinkClass : undefined} aria-current={isActive('/blog') ? 'page' : undefined} to="/blog">Blog</Link></li>
                        <li><Link className={isActive('/E-Commerce') ? activeLinkClass : undefined} aria-current={isActive('/E-Commerce') ? 'page' : undefined} to="/E-Commerce">E-Commerce</Link></li>
                        <li className="mt-2 border-t border-gray-200 pt-5 lg:hidden">
                            <Link className={isActive('/login') ? 'font-semibold text-button' : 'text-button'} aria-current={isActive('/login') ? 'page' : undefined} to="/login">Log in</Link>
                        </li>
                        <li className="lg:hidden">
                            <Link className="inline-flex rounded-md bg-button px-4 py-2 text-sm text-white" to="/register">Sign up</Link>
                        </li>
                    </ul>
                </div>
                <div className="hidden items-center gap-6 lg:flex lg:gap-20">
                    <Link to="/E-Commerce" aria-label="Buka E-Commerce">
                        <img src={navbarTransparent ? belanjaWhite : belanjaBlack} alt="" />
                    </Link>
                    <div className="flex justify-center items-center gap-5">
                        <Link to="/login"
                            className={`text-[18px] font-normal transition-colors duration-300
                                ${navbarTransparent ? 'text-white' : 'text-button'}`}
                        >
                            Log in
                        </Link>
                        <Button onClick={() => navigate("/register")} className="w-29.75 h-12.25">Sign up</Button>
                    </div>
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