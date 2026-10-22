import { Link } from "react-router-dom"

const NotFound = () => {
    return (
        <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 text-center">
            <h1 className="text-6xl font-bold text-button">404</h1>
            <p className="text-[18px] text-abu">Halaman yang kamu cari tidak ditemukan.</p>
            <Link className="mt-4 rounded-2xl bg-button px-6 py-3 text-white" to="/">Kembali ke Home</Link>
        </section>
    )
}

export default NotFound
