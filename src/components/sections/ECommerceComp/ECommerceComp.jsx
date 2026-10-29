import SectionHeader from "../../ui/SectionHeader"
import ProductCard from "./ProductCard"
import allProducts from "../../../data/products"

const ECommerceComp = ({ products = allProducts, limit, showHeader = false, emptyText = "Produk tidak ditemukan." })=>{
    const visibleProducts = limit ? products.slice(0, limit) : products

    return <> {showHeader && <SectionHeader
            category="E-Commerce"
            label ="Jelajahi UMKM Pilihan Rangers"
            ket ="Temukan inovasi dan keunikan terbaru dari bisnis-bisnis mahasiswa
            Universitas Andalas pada banyak kategori"
            to='/e-commerce'
        />}
    {visibleProducts.length === 0 ? (
        <p className="rounded-lg bg-white px-6 py-12 text-center text-abu">{emptyText}</p>
    ) : (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </section>
    )}
    </>
}

export default ECommerceComp
