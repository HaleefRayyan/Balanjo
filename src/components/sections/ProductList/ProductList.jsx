import { useSearchParams } from "react-router-dom"
import ECommerceComp from "../ECommerceComp"
import Pagination from "../../ui/Pagination"
import { ErrorMessage, Loading } from "../../ui/Status"
import { useProducts } from "../../../api/products"
import useDebouncedValue from "../../../hooks/useDebouncedValue"

const PAGE_SIZE = 8

// Produk dari API, difilter `category` + teks `query`, dengan halaman (?page=) di URL
const ProductList = ({ category, query = "" }) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const q = useDebouncedValue(query.trim())
    const page = Math.max(1, Number(searchParams.get("page")) || 1)
    const { data, isPending, isError, error, refetch } = useProducts({ q, category, page, pageSize: PAGE_SIZE })

    const goToPage = (next) => {
        const params = new URLSearchParams(searchParams)
        params.set("page", next)
        setSearchParams(params)
    }

    if (isPending) return <Loading />
    if (isError) return <ErrorMessage error={error} onRetry={refetch} />

    return (
        <>
            <ECommerceComp
                products={data.products}
                emptyText={q ? `Produk "${q}" tidak ditemukan.` : "Belum ada produk di kategori ini."}
            />
            <Pagination page={data.page} pageSize={PAGE_SIZE} total={data.total} onPageChange={goToPage} />
        </>
    )
}

export default ProductList
