import { useSearchParams } from "react-router-dom"
import ECommerceComp from "../ECommerceComp"
import ProductFilters from "./ProductFilters"
import Pagination from "../../ui/Pagination"
import { ErrorMessage, Loading } from "../../ui/Status"
import { useProducts } from "../../../api/products"
import useDebouncedValue from "../../../hooks/useDebouncedValue"

const PAGE_SIZE = 8

// Produk dari API, difilter `category` + teks `query`, dengan halaman (?page=), urutan (?sort=)
// dan rentang harga (?minPrice=&maxPrice=) di URL
const ProductList = ({ category, query = "" }) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const q = useDebouncedValue(query.trim())
    const page = Math.max(1, Number(searchParams.get("page")) || 1)
    const sort = searchParams.get("sort") || undefined
    const minPrice = searchParams.get("minPrice") || undefined
    const maxPrice = searchParams.get("maxPrice") || undefined
    const { data, isPending, isError, error, refetch } = useProducts({ q, category, page, pageSize: PAGE_SIZE, sort, minPrice, maxPrice })

    // ubah filter -> kembali ke halaman 1; nilai kosong dibuang dari URL
    const changeFilters = (changes) => {
        const params = new URLSearchParams(searchParams)
        for (const [key, value] of Object.entries(changes)) {
            if (value) params.set(key, value)
            else params.delete(key)
        }
        params.delete("page")
        setSearchParams(params)
    }

    const goToPage = (next) => {
        const params = new URLSearchParams(searchParams)
        params.set("page", next)
        setSearchParams(params)
    }

    const filtered = minPrice || maxPrice
    return (
        <>
            <ProductFilters key={`${minPrice}-${maxPrice}`} sort={sort} minPrice={minPrice} maxPrice={maxPrice} onChange={changeFilters} />
            {isPending ? <Loading /> : isError ? <ErrorMessage error={error} onRetry={refetch} /> : (
                <>
                    <ECommerceComp
                        products={data.products}
                        emptyText={q ? `Produk "${q}" tidak ditemukan.` : filtered ? "Tidak ada produk di rentang harga ini." : "Belum ada produk di kategori ini."}
                    />
                    <Pagination page={data.page} pageSize={PAGE_SIZE} total={data.total} onPageChange={goToPage} />
                </>
            )}
        </>
    )
}

export default ProductList
