import { Link } from "react-router-dom"
import { useAdminStats } from "../../../api/admin"
import { ErrorMessage } from "../../../components/ui/Status"
import { formatRupiah } from "../../../utils/format"

const cards = [
    { key: "users", label: "Total User" },
    { key: "sellers", label: "Total Seller" },
    { key: "blogs", label: "Total Blog" },
    { key: "forums", label: "Total Forum" },
]

// Uang lewat Midtrans + antrean yang perlu ditindaklanjuti admin
const moneyCards = [
    { key: "sales", label: "Penjualan online", money: true, hint: "Dibayar lewat Midtrans, dikurangi refund" },
    { key: "platformIncome", label: "Pendapatan platform", money: true, hint: "Potongan dari pesanan Selesai" },
    { key: "pendingRefunds", label: "Refund menunggu", to: "/admin/orders/refunds" },
    { key: "pendingPayouts", label: "Payout menunggu", to: "/admin/payouts" },
]

const Dashboard = () => {
    const { data: stats, isError, error, refetch } = useAdminStats()

    if (isError) return <ErrorMessage error={error} onRetry={refetch} />

    return (
        <section className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                    <div key={card.key} className="rounded-lg bg-white px-6 py-8 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                        <p className="text-[18px] text-[#555]">{card.label}</p>
                        <p className="mt-1 text-[32px] font-medium text-[#333]">{stats ? stats[card.key].toLocaleString("id-ID") : "–"}</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {moneyCards.map((card) => {
                    const value = stats ? (card.money ? formatRupiah(stats[card.key]) : stats[card.key].toLocaleString("id-ID")) : "–"
                    const body = (
                        <>
                            <p className="text-[18px] text-[#555]">{card.label}</p>
                            <p className={`mt-1 text-[28px] font-medium ${card.to && stats?.[card.key] > 0 ? "text-button" : "text-[#333]"}`}>{value}</p>
                            {card.hint && <p className="mt-1 text-xs text-abu">{card.hint}</p>}
                        </>
                    )
                    const className = "rounded-lg bg-white px-6 py-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                    return card.to
                        ? <Link key={card.key} to={card.to} className={`${className} hover:ring-1 hover:ring-button`}>{body}</Link>
                        : <div key={card.key} className={className}>{body}</div>
                })}
            </div>
        </section>
    )
}

export default Dashboard
