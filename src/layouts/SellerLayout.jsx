import PanelLayout from "../components/layout/PanelLayout"
import { BagIcon, CartIcon, DashboardIcon, FolderGearIcon, WalletIcon } from "../components/ui/icons"

// Seller Centre (desain: Dashboard, Produk, Pesanan). "Penghasilan" dan "Banner Promosi" tambahan.
const menu = [
    { label: "Dashboard", to: "/seller", icon: DashboardIcon, end: true },
    { label: "Produk", to: "/seller/products", icon: BagIcon },
    { label: "Pesanan", to: "/seller/orders", icon: CartIcon },
    { label: "Penghasilan", to: "/seller/earnings", icon: WalletIcon },
    { label: "Banner Promosi", to: "/seller/banners", icon: FolderGearIcon },
]

const SellerLayout = () => (
    <PanelLayout
        menu={menu}
        menuLabel="menu Seller Centre"
        homeLink="/seller"
        topbarLeft={<span className="rounded bg-[#f4eddb] px-2.5 py-1 text-[13px] font-medium text-button">Seller Centre</span>}
    />
)

export default SellerLayout
