import { useSearchParams } from "react-router-dom"
import SellerProducts from "./SellerProducts"
import SellerOrders from "./SellerOrders"
import SellerBanners from "./SellerBanners"

const tabs = [
    { key: "products", label: "Produk", component: SellerProducts },
    { key: "orders", label: "Pesanan Masuk", component: SellerOrders },
    { key: "banners", label: "Banner Promosi", component: SellerBanners },
]

// "Toko Saya": tab aktif disimpan di URL (?tab=) supaya bisa dibuka langsung / tombol back berfungsi
const Seller = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const active = tabs.find((tab) => tab.key === searchParams.get("tab")) ?? tabs[0]
    const ActiveTab = active.component

    return (
        <main className="mx-auto w-full max-w-[1720px] px-5 pb-24 pt-16 sm:px-8 lg:px-[6.5vw]">
            <div className="mb-6 flex items-center gap-3 text-button">
                <span className="h-0.75 w-16 bg-button" />
                <h1 className="text-2xl font-semibold sm:text-3xl">Toko Saya</h1>
            </div>

            <div role="tablist" aria-label="Menu toko" className="mb-8 flex gap-6 overflow-x-auto border-b border-line">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={tab.key === active.key}
                        onClick={() => setSearchParams(tab.key === "products" ? {} : { tab: tab.key })}
                        className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 pb-3 text-[16px] transition-colors ${tab.key === active.key ? "border-button font-semibold text-button" : "border-transparent text-abu hover:text-button"}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <ActiveTab />
        </main>
    )
}

export default Seller
