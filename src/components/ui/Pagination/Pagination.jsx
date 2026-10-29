const Pagination = ({ page, pageSize, total, onPageChange }) => {
    const pageCount = Math.max(1, Math.ceil(total / pageSize))
    if (total === 0) return null

    const from = (page - 1) * pageSize + 1
    const to = Math.min(page * pageSize, total)

    return (
        <nav className="mt-8 flex flex-wrap items-center justify-end gap-5 text-[11px] sm:text-[13px]" aria-label="Halaman">
            <span>Showing <strong>{from} to {to}</strong> results of {total} results</span>
            <button type="button" aria-label="Halaman sebelumnya" disabled={page <= 1} className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-30" onClick={() => onPageChange(page - 1)}>‹</button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                <button
                    key={number}
                    type="button"
                    aria-current={number === page ? "page" : undefined}
                    className={`h-8 w-8 cursor-pointer rounded-md ${number === page ? "bg-button text-white" : "hover:bg-white"}`}
                    onClick={() => onPageChange(number)}
                >
                    {number}
                </button>
            ))}
            <button type="button" aria-label="Halaman berikutnya" disabled={page >= pageCount} className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-30" onClick={() => onPageChange(page + 1)}>›</button>
        </nav>
    )
}

export default Pagination
