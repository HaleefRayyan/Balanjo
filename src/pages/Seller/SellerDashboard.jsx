import { Link } from "react-router-dom"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { useSellerOrders, useSellerStats } from "../../api/seller"
import { formatRupiah } from "../../utils/format"
import SellerOrderTable from "./SellerOrderTable"
import flattenOrders from "./flattenOrders"

const RECENT = 5

// Dashboard Seller Centre: Total Revenue, Total Order, Riwayat Pesanan terbaru
const SellerDashboard = () => {
    const stats = useSellerStats()
    const orders = useSellerOrders()
    const rows = orders.data ? flattenOrders(orders.data) : []

    return (
        <section>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-white px-6 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                    <p className="text-sm text-[#555]">Total Revenue</p>
                    <p className="mt-1 text-[26px] font-medium text-[#333]">{stats.data ? formatRupiah(stats.data.revenue) : "–"}</p>
                </div>
                <div className="rounded-lg bg-white px-6 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                    <p className="text-sm text-[#555]">Total Order</p>
                    <p className="mt-1 text-[26px] font-medium text-[#333]">{stats.data ? stats.data.orders.toLocaleString("id-ID") : "–"}</p>
                </div>
            </div>
            {stats.isError && <ErrorMessage error={stats.error} onRetry={stats.refetch} className="mt-4" />}

            <div className="mb-4 mt-8 flex items-center justify-between gap-3">
                <h1 className="text-[18px] font-medium text-button">Riwayat Pesanan</h1>
                {rows.length > RECENT && <Link to="/seller/orders" className="text-sm text-button hover:underline">Lihat semua</Link>}
            </div>
            {orders.isPending ? <Loading /> : orders.isError ? <ErrorMessage error={orders.error} onRetry={orders.refetch} /> : (
                <SellerOrderTable rows={rows.slice(0, RECENT)} />
            )}
        </section>
    )
}

export default SellerDashboard
