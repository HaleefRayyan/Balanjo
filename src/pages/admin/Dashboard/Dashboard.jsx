import stats from "../../../data/stats"

const Dashboard = () => {
    return (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg bg-white px-6 py-8 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                    <p className="text-[18px] text-[#555]">{stat.label}</p>
                    <p className="mt-1 text-[32px] font-medium text-[#333]">{stat.value.toLocaleString("id-ID")}</p>
                </div>
            ))}
        </section>
    )
}

export default Dashboard
