import ProductList, { ProductSearch } from "../../components/sections/ProductList"
import useProductQuery from "../../components/sections/ProductList/useProductQuery"
import iklan from "../../assets/ECommerce/iklan.png"
import iklanDua from "../../assets/ECommerce/iklanDua.png"
import { productCategories } from "../../constants/categories"
import { Link } from "react-router-dom"

const ECommerce = () => {
    const [query, setQuery] = useProductQuery()

    return (
        <main className="mx-auto w-full max-w-[1720px] px-5 pb-20 pt-29 lg:pt-16 sm:px-8 lg:px-[6.5vw]">
            <ProductSearch value={query} onChange={setQuery} />

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <img className="h-auto w-full rounded-lg" src={iklan} alt="Mega sale special promo" />
                <Link to="/seller" aria-label="Mau jual produk sendiri? Buka Toko Saya">
                    <img className="h-auto w-full rounded-lg transition-opacity hover:opacity-90" src={iklanDua} alt="Mau jual produk sendiri?" />
                </Link>
            </div>

            <div className="mt-12 grid grid-cols-4 gap-3 rounded-lg bg-white px-4 py-4 sm:grid-cols-8 sm:gap-5 sm:px-8">
                {productCategories.map(({ icon, label }) => (
                    <Link className="flex min-w-0 flex-col items-center gap-1 text-xs leading-tight sm:text-[18px] sm:leading-normal" key={label} to={`/e-commerce/category/${encodeURIComponent(label)}`}>
                        <span className="flex h-14 w-14 items-center justify-center rounded-md bg-button sm:h-20 sm:w-20">
                            <img className="h-9 w-9 sm:h-12 sm:w-12" src={icon} alt="" />
                        </span>
                        <span className="truncate">{label}</span>
                    </Link>
                ))}
            </div>

            <div className="mt-12">
                <ProductList query={query} />
            </div>
        </main>
    )
}

export default ECommerce
