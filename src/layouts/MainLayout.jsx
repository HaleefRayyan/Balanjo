import { Outlet, useMatches } from "react-router-dom"
import Navbar from "../components/layout/Navbar"
import Footer from "../components/layout/Footer"

// Route dengan handle { navOverlay: true } (Home) menaruh konten di bawah navbar transparan;
// halaman lain diberi jarak setinggi navbar (h-20 / lg:h-33).
const MainLayout = () => {
    const navOverlay = useMatches().some((match) => match.handle?.navOverlay)

    return (
        <>
            <Navbar overlay={navOverlay} />
            <div className={navOverlay ? undefined : "pt-20 lg:pt-33"}>
                <Outlet />
            </div>
            <Footer />
        </>
    )
}

export default MainLayout
