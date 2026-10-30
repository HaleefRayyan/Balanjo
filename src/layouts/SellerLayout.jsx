import PanelLayout from "../components/layout/PanelLayout"
import { useSellerStats } from "../api/seller"
import { BagIcon, CartIcon, DashboardIcon, FolderGearIcon, WalletIcon } from "../components/ui/icons"

// Seller Centre (desain: Dashboard, Produk, Pesanan). "Penghasilan" dan "Banner Promosi" tambahan.
const menu = [
    { label: "Dashboard", to: "/seller", icon: DashboardIcon, end: true },
    { label: "Produk", to: "/seller/products", icon: BagIcon },
    { label: "Pesanan", to: "/seller/orders", icon: CartIcon },
    { label: "Penghasilan", to: "/seller/earnings", icon: WalletIcon },
    { label: "Banner Promosi", to: "/seller/banners", icon: FolderGearIcon },
]

// Badge di "Pesanan": item dibayar yang belum diproses (dicek ulang tiap menit)
const SellerLayout = () => {
    const { data: stats } = useSellerStats({ refetchInterval: 60_000 })
    return (
    <PanelLayout
        menu={menu.map((item) => (item.to === "/seller/orders" ? { ...item, badge: stats?.toProcess } : item))}
        menuLabel="menu Seller Centre"
        homeLink="/seller"
        topbarLeft={<span className="rounded bg-[#f4eddb] px-2.5 py-1 text-[13px] font-medium text-button">Seller Centre</span>}
    />
    )
}

export default SellerLayout
