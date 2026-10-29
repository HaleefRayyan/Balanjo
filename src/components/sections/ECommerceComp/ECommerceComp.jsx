import SectionHeader from "../../ui/SectionHeader"
import { Empty, ErrorMessage, Loading } from "../../ui/Status"
import ProductCard from "./ProductCard"
import { useProducts } from "../../../api/products"

// products: daftar yang sudah diambil halaman. Kalau tidak diberikan, komponen mengambil
// `limit` produk pertama sendiri (dipakai di Get Started).
const ECommerceComp = ({ products, limit = 8, showHeader = false, emptyText = "Produk tidak ditemukan." })=>{
    const query = useProducts({ pageSize: limit }, { enabled: products === undefined })
    const list = products === undefined ? query.data?.products : products

    let content
    if (!list && query.isError) content = <ErrorMessage error={query.error} onRetry={query.refetch} />
    else if (!list) content = <Loading />
    else if (list.length === 0) content = <Empty text={emptyText} />
    else content = (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {list.map((product) => <ProductCard key={product.id} product={product} />)}
        </section>
    )

    return <> {showHeader && <SectionHeader
            category="E-Commerce"
            label ="Jelajahi UMKM Pilihan Rangers"
            ket ="Temukan inovasi dan keunikan terbaru dari bisnis-bisnis mahasiswa
            Universitas Andalas pada banyak kategori"
            to='/e-commerce'
        />}
    {content}
    </>
}

export default ECommerceComp
