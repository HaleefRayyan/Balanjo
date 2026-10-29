import { Link } from "react-router-dom"
import StatusBadge from "../../components/ui/StatusBadge"
import { Empty, ErrorMessage, Loading } from "../../components/ui/Status"
import { useCancelOrder, useMyOrders } from "../../api/orders"
import { orderStatus } from "../../constants/orders"
import { formatDateTime, formatRupiah } from "../../utils/format"

// Pesanan bisa dibatalkan pembeli selama belum ada seller yang memprosesnya
const canCancel = (order) => order.items.every((item) => item.status === "PENDING")

const OrderCard = ({ order }) => {
    const cancelOrder = useCancelOrder()

    const handleCancel = () => {
        if (window.confirm(`Batalkan pesanan #${order.id}?`)) {
            cancelOrder.mutate(order.id, { onError: (error) => window.alert(error.message) })
        }
    }

    return (
        <article className="rounded-lg bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] sm:p-6">
            <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
                <h2 className="font-semibold text-[#2d2d2d]">Pesanan #{order.id}</h2>
                <span className="text-sm text-abu">{formatDateTime(new Date(order.createdAt))}</span>
            </header>

            <ul className="divide-y divide-[#eee]">
                {order.items.map((item) => (
                    <li key={item.id} className="flex gap-4 py-4">
                        {item.photo
                            ? <img src={item.photo} alt="" className="h-18 w-18 shrink-0 rounded-md object-cover" />
                            : <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-md bg-[#f1f1f1] text-center text-[10px] text-abu">Produk dihapus</div>}
                        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                {item.photo && item.productId
                                    ? <Link to={`/e-commerce/product/${item.productId}`} className="font-medium hover:text-button">{item.name}</Link>
                                    : <span className="font-medium">{item.name}</span>}
                                <p className="text-sm text-abu">
                                    {item.variant && <>Variasi: {item.variant} · </>}
                                    {item.quantity} × {formatRupiah(item.price)}
                                </p>
                                {item.seller && <p className="text-xs text-abu">Seller: {item.seller}</p>}
                            </div>
                            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                                <StatusBadge status={item.status} statuses={orderStatus} />
                                <span className="font-semibold">{formatRupiah(item.price * item.quantity)}</span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                <span className="font-semibold">Total {formatRupiah(order.total)}</span>
                {canCancel(order) && (
                    <button
                        type="button"
                        disabled={cancelOrder.isPending}
                        onClick={handleCancel}
                        className="cursor-pointer rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                    >
                        {cancelOrder.isPending ? "Membatalkan..." : "Batalkan pesanan"}
                    </button>
                )}
            </footer>
        </article>
    )
}

const Orders = () => {
    const { data: orders, isPending, isError, error, refetch } = useMyOrders()

    let content
    if (isPending) content = <Loading />
    else if (isError) content = <ErrorMessage error={error} onRetry={refetch} />
    else if (orders.length === 0) content = (
        <div>
            <Empty text="Kamu belum punya pesanan." />
            <p className="mt-4 text-center"><Link to="/e-commerce" className="text-button hover:underline">Mulai belanja</Link></p>
        </div>
    )
    else content = <div className="space-y-5">{orders.map((order) => <OrderCard key={order.id} order={order} />)}</div>

    return (
        <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-16 sm:px-8">
            <div className="mb-8 flex items-center gap-3 text-button">
                <span className="h-0.75 w-16 bg-button" />
                <h1 className="text-2xl font-semibold sm:text-3xl">Pesanan Saya</h1>
            </div>
            {content}
        </main>
    )
}

export default Orders
