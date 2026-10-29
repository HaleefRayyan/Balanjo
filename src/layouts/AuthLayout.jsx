import { Outlet } from "react-router-dom"
import heroBg from "../assets/Hero/heroBg.png"

// Latar emas + kartu putih untuk Login, Register, dan Lupa Password
const AuthLayout = () => {
    return (
        <main
            className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-8 sm:px-8"
            style={{
                backgroundImage: `linear-gradient(180deg, rgba(160, 131, 54, 0.8) 0%, rgba(160, 131, 54, 0.2) 100%), url(${heroBg})`,
            }}
        >
            <section className="flex w-full max-w-211 flex-col rounded-[10px] bg-white px-8 py-8 shadow-[0_2px_8px_rgba(0,0,0,0.18)] sm:px-16 sm:py-9 lg:px-[81.5px]">
                <Outlet />
            </section>
        </main>
    )
}

export default AuthLayout
