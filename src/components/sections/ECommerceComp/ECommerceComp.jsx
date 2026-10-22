import Button from "../../ui/Button"
import { useNavigate } from "react-router-dom"
import SectionHeader from "../../ui/SectionHeader"
import products from "../../../data/products"

const ECommerceComp = ({ limit, showHeader = false })=>{
    const navigate = useNavigate()
    const visibleProducts = limit ? products.slice(0, limit) : products

    return <> {showHeader && <SectionHeader
            category="E-Commerce"
            label ="Jelajahi UMKM Pilihan Rangers"
            ket ="Temukan inovasi dan keunikan terbaru dari bisnis-bisnis mahasiswa
            Universitas Andalas pada banyak kategori"
            to='/e-commerce'
        />}
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
        {visibleProducts.map((item) => (
            <article className="overflow-hidden rounded-lg bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]" key={item.id}>
                <img src={item.photo} alt={item.name} className="aspect-281/223 w-full object-cover" />
                <div className="flex min-h-36 flex-col items-center px-2 py-3 text-center sm:min-h-45 sm:px-4 sm:py-4">
                    <h2 className="text-xs font-normal text-abu sm:text-[16px]">{item.category}</h2>
                    <h3 className="min-h-8 text-sm font-normal leading-tight sm:min-h-10.5 sm:text-[18px]">{item.name}</h3>
                    <span className="mt-2 text-base font-semibold sm:mt-4 sm:text-[20px]">{item.price}</span>
                    <Button onClick={() => navigate(`/e-commerce/product/${item.id}`)} className="mt-2 h-9 w-full max-w-37.5 rounded-md text-[11px] sm:mt-4 sm:h-11 sm:text-[14px]">+ Keranjang</Button>
                </div>
            </article>
        ))}
    </section>
    </>
}

export default ECommerceComp
