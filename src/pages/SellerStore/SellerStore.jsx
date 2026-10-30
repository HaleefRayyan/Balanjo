import { useParams } from "react-router-dom"
import ProductList, { ProductSearch } from "../../components/sections/ProductList"
import useProductQuery from "../../components/sections/ProductList/useProductQuery"
import Avatar from "../../components/ui/Avatar"
import { StarRating } from "../../components/ui/Stars"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { useSellerStore } from "../../api/sellers"
import NotFound from "../NotFound"

const monthYear = (date) => date.toLocaleDateString("id-ID", { month: "long", year: "numeric" })

// Halaman toko seller: profil singkat + semua produknya (bisa dicari, diurutkan, difilter harga)
const SellerStore = () => {
    const { id } = useParams()
    const { data: seller, isPending, isError, error, refetch } = useSellerStore(id)
    const [query, setQuery] = useProductQuery()

    if (isPending) return <main className="px-5 pt-29 lg:pt-16 sm:px-8 lg:px-[6.5vw]"><Loading /></main>
    if (isError && error.status === 404) return <NotFound />
    if (isError) return <main className="px-5 pt-29 lg:pt-16 sm:px-8 lg:px-[6.5vw]"><ErrorMessage error={error} onRetry={refetch} /></main>

    const stats = [
        { label: "Produk", value: seller.productCount.toLocaleString("id-ID") },
        { label: "Terjual", value: seller.sold.toLocaleString("id-ID") },
        { label: "Bergabung", value: monthYear(new Date(seller.joinedAt)) },
    ]

    return (
        <main className="mx-auto w-full max-w-[1720px] px-5 pb-20 pt-29 lg:pt-16 sm:px-8 lg:px-[6.5vw]">
            <section className="flex flex-col gap-5 rounded-lg bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] sm:flex-row sm:items-center sm:p-7">
                <Avatar name={seller.name} src={seller.avatar} size="h-20 w-20" textSize="text-3xl" />
                <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wide text-abu">Toko</p>
                    <h1 className="truncate text-2xl font-semibold text-[#2d2d2d] sm:text-3xl">{seller.name}</h1>
                    <p className="mt-1 flex items-center gap-2 text-sm text-[#555]">
                        {seller.rating.count > 0
                            ? <><StarRating value={seller.rating.average} /> {seller.rating.average} · {seller.rating.count} ulasan</>
                            : <span className="text-abu">Belum ada ulasan</span>}
                    </p>
                </div>
                <dl className="grid grid-cols-3 gap-4 text-center sm:gap-8">
                    {stats.map((stat) => (
                        <div key={stat.label}>
                            <dt className="text-xs text-abu">{stat.label}</dt>
                            <dd className="mt-0.5 text-base font-medium text-[#333]">{stat.value}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <div className="mt-8">
                <ProductSearch value={query} onChange={setQuery} />
            </div>
            <div className="mt-8">
                <ProductList sellerId={seller.id} query={query} />
            </div>
        </main>
    )
}

export default SellerStore
