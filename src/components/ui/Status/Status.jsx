// Tampilan standar untuk data yang sedang dimuat / gagal dimuat / kosong

export const Loading = ({ text = "Memuat...", className = "" }) => (
    <p role="status" className={`rounded-lg bg-white px-6 py-12 text-center text-abu ${className}`}>{text}</p>
)

export const ErrorMessage = ({ error, onRetry, className = "" }) => (
    <div role="alert" className={`rounded-lg bg-white px-6 py-12 text-center ${className}`}>
        <p className="text-red-600">{error?.message ?? "Terjadi kesalahan."}</p>
        {onRetry && (
            <button type="button" onClick={onRetry} className="mt-4 cursor-pointer rounded-md border border-button px-4 py-2 text-sm text-button hover:bg-button/10">
                Coba lagi
            </button>
        )}
    </div>
)

export const Empty = ({ text, className = "" }) => (
    <p className={`rounded-lg bg-white px-6 py-12 text-center text-abu ${className}`}>{text}</p>
)

// Pilih salah satu: loading / error / kosong / isi. `query` = hasil useQuery.
export const QueryState = ({ query, isEmpty, emptyText, loadingText, children }) => {
    if (query.isPending) return <Loading text={loadingText} />
    if (query.isError) return <ErrorMessage error={query.error} onRetry={query.refetch} />
    if (isEmpty?.(query.data)) return <Empty text={emptyText} />
    return children(query.data)
}
