import StatusBadge from "../../components/ui/StatusBadge"
import { Empty, ErrorMessage, Loading } from "../../components/ui/Status"
import { useSellerOrders, useUpdateOrderItemStatus } from "../../api/seller"
import { nextStatuses, orderStatus } from "../../constants/orders"
import { formatDateTime, formatRupiah } from "../../utils/format"

const ItemStatus = ({ item }) => {
    const updateStatus = useUpdateOrderItemStatus()
    const options = nextStatuses(item.status)

    const handleChange = (event) => {
        const status = event.target.value
        if (status === "CANCELLED" && !window.confirm(`Batalkan pesanan ${item.name}?`)) return
        updateStatus.mutate({ id: item.id, status }, { onError: (error) => window.alert(error.message) })
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={item.status} statuses={orderStatus} />
            {options.length > 0 && (
                <select
                    aria-label={`Ubah status ${item.name}`}
                    value=""
                    disabled={updateStatus.isPending}
                    onChange={handleChange}
                    className="h-8 cursor-pointer rounded border border-[#d7d7d7] bg-white px-2 text-xs outline-none focus:border-button disabled:cursor-wait"
                >
                    <option value="" disabled>Ubah status…</option>
                    {options.map((status) => <option key={status} value={status}>{orderStatus[status].label}</option>)}
                </select>
            )}
        </div>
    )
}

// Pesanan berisi produk milik seller ini (item dari seller lain tidak ditampilkan)
const SellerOrders = () => {
    const { data: orders, isPending, isError, error, refetch } = useSellerOrders()

    if (isPending) return <Loading />
    if (isError) return <ErrorMessage error={error} onRetry={refetch} />
    if (orders.length === 0) return <Empty text="Belum ada pesanan masuk." />

    return (
        <div className="space-y-5">
            {orders.map((order) => {
                const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
                return (
                    <article key={order.orderId} className="rounded-lg bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] sm:p-6">
                        <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
                            <div>
                                <h2 className="font-semibold text-[#2d2d2d]">Pesanan #{order.orderId}</h2>
                                <p className="text-sm text-abu">Pembeli: {order.buyer.name} · <a href={`mailto:${order.buyer.email}`} className="text-button hover:underline">{order.buyer.email}</a></p>
                            </div>
                            <span className="text-sm text-abu">{formatDateTime(new Date(order.createdAt))}</span>
                        </header>
                        <ul className="divide-y divide-[#eee]">
                            {order.items.map((item) => (
                                <li key={item.id} className="flex flex-wrap items-center gap-4 py-4">
                                    {item.photo
                                        ? <img src={item.photo} alt="" className="h-14 w-14 shrink-0 rounded-md object-cover" />
                                        : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-[#f1f1f1] text-center text-[10px] text-abu">Produk dihapus</div>}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-abu">
                                            {item.variant && <>Variasi: {item.variant} · </>}
                                            {item.quantity} × {formatRupiah(item.price)}
                                        </p>
                                    </div>
                                    <ItemStatus item={item} />
                                </li>
                            ))}
                        </ul>
                        <footer className="border-t border-line pt-3 text-right font-semibold">Total untuk tokomu {formatRupiah(total)}</footer>
                    </article>
                )
            })}
        </div>
    )
}

export default SellerOrders
