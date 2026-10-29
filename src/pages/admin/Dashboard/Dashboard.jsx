import { useAdminStats } from "../../../api/admin"
import { ErrorMessage } from "../../../components/ui/Status"

const cards = [
    { key: "users", label: "Total User" },
    { key: "sellers", label: "Total Seller" },
    { key: "blogs", label: "Total Blog" },
    { key: "forums", label: "Total Forum" },
]

const Dashboard = () => {
    const { data: stats, isError, error, refetch } = useAdminStats()

    if (isError) return <ErrorMessage error={error} onRetry={refetch} />

    return (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
                <div key={card.key} className="rounded-lg bg-white px-6 py-8 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                    <p className="text-[18px] text-[#555]">{card.label}</p>
                    <p className="mt-1 text-[32px] font-medium text-[#333]">{stats ? stats[card.key].toLocaleString("id-ID") : "–"}</p>
                </div>
            ))}
        </section>
    )
}

export default Dashboard
