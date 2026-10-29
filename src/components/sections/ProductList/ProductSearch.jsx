import { useNavigate } from "react-router-dom"
import Search from "../../ui/Search"

const searchClass = "h-10 w-full rounded-md px-4 text-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.08)] placeholder:text-[#aaa]"

// Tanpa `action`: input terkontrol (value/onChange) yang memfilter daftar di halaman ini.
// Dengan `action`: Enter membawa ke halaman itu, mis. dari detail produk ke /e-commerce?q=...
const ProductSearch = ({ action, value, onChange }) => {
    const navigate = useNavigate()

    if (action) {
        const handleSubmit = (event) => {
            event.preventDefault()
            const q = new FormData(event.currentTarget).get("q").trim()
            navigate(q ? `${action}?q=${encodeURIComponent(q)}` : action)
        }
        return (
            <form role="search" onSubmit={handleSubmit}>
                <Search name="q" className={searchClass} placeholder="Search for products..." aria-label="Cari produk" />
            </form>
        )
    }

    return (
        <form role="search" onSubmit={(event) => event.preventDefault()}>
            <Search
                className={searchClass}
                placeholder="Search for products..."
                aria-label="Cari produk"
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
        </form>
    )
}

export default ProductSearch
