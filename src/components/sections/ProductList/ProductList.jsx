import { useSearchParams } from "react-router-dom"
import ECommerceComp from "../ECommerceComp"
import Pagination from "../../ui/Pagination"
import { searchProducts } from "../../../data/products"

const PAGE_SIZE = 8

// Daftar produk yang difilter `query`, dengan halaman (?page=) di URL
const ProductList = ({ products, query = "" }) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const filtered = searchProducts(products, query)
    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const page = Math.min(pageCount, Math.max(1, Number(searchParams.get("page")) || 1))
    const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const goToPage = (next) => {
        const params = new URLSearchParams(searchParams)
        params.set("page", next)
        setSearchParams(params)
    }

    return (
        <>
            <ECommerceComp
                products={visible}
                emptyText={query.trim() ? `Produk "${query.trim()}" tidak ditemukan.` : "Belum ada produk di kategori ini."}
            />
            <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={goToPage} />
        </>
    )
}

export default ProductList
