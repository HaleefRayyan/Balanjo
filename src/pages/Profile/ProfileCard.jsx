// Kartu putih dengan judul di dalamnya (gaya halaman Kelola Profile User)
const ProfileCard = ({ title, action, children, className = "" }) => (
    <section className={`rounded-lg bg-white px-5 py-6 sm:px-7 ${className}`}>
        {(title || action) && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                {title && <h1 className="text-[17px] font-semibold text-black">{title}</h1>}
                {action}
            </div>
        )}
        {children}
    </section>
)

export default ProfileCard
