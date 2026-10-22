import Search from "../../components/ui/Search"
import ECommerceComp from "../../components/sections/ECommerceComp"
import iklan from "../../assets/ECommerce/iklan.png"
import iklanDua from "../../assets/ECommerce/iklanDua.png"
import { productCategories } from "../../data/products"
import { useNavigate } from "react-router-dom"

const ECommerce = () => {

    const navigate = useNavigate();

    return <>
        <main className="mx-auto w-full max-w-[1720px] px-5 pb-20 pt-29 lg:pt-16 sm:px-8 lg:px-[6.5vw]">
            <Search className="h-10 w-full rounded-md px-4 text-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.08)] placeholder:text-[#aaa]" placeholder="Search for products..." />

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <img className="h-auto w-full rounded-lg" src={iklan} alt="Mega sale special promo" />
                <img className="h-auto w-full rounded-lg" src={iklanDua} alt="Mau jual produk sendiri?" />
            </div>

            <div className="mt-12 grid grid-cols-4 gap-3 rounded-lg bg-white px-4 py-4 sm:grid-cols-8 sm:gap-5 sm:px-8">
                {productCategories.map(({ icon, label }) => (
                    <button className="flex min-w-0 cursor-pointer flex-col items-center gap-1 text-xs leading-tight sm:text-[18px] sm:leading-normal" key={label} type="button" onClick={() => navigate(`/e-commerce/category/${encodeURIComponent(label)}`)}>
                        <span className="flex h-14 w-14 items-center justify-center rounded-md bg-button sm:h-20 sm:w-20">
                            <img className="h-9 w-9 sm:h-12 sm:w-12" src={icon} alt="" />
                        </span>
                        <span className="truncate">{label}</span>
                    </button>
                ))}
            </div>

            <div className="mt-12">
                <ECommerceComp />
            </div>

            <div className="mt-8 flex items-center justify-end gap-5 text-[11px]">
                <span>Showing <strong>1 to 12</strong> results of 24 results</span>
                <button type="button" aria-label="Previous page">‹</button>
                <button className="h-8 w-8 rounded-md bg-button text-white" type="button">1</button>
                <button type="button">2</button>
                <button type="button" aria-label="Next page">›</button>
            </div>
        </main>
    </>
}

export default ECommerce