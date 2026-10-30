import { useState } from "react"
import DataTable from "../../../components/admin/DataTable"
import Modal from "../../../components/admin/Modal"
import PageTitle from "../../../components/admin/PageTitle"
import Pagination from "../../../components/ui/Pagination"
import StatusBadge from "../../../components/ui/StatusBadge"
import { ErrorMessage, Loading } from "../../../components/ui/Status"
import { useAdminOrders } from "../../../api/admin"
import { orderStatus, paymentStatus } from "../../../constants/orders"
import { deliveryLabel, refundStatus } from "../../../constants/shop"
import { formatCode, formatDateTime, formatRupiah } from "../../../utils/format"

const filters = [
    { value: undefined, label: "Semua" },
    { value: "PAID", label: "Dibayar" },
    { value: "UNPAID", label: "Menunggu bayar" },
    { value: "EXPIRED", label: "Kedaluwarsa" },
    { value: "CANCELLED", label: "Dibatalkan" },
]

const PaymentLabel = ({ payment }) => (
    <span className={paymentStatus[payment.status]?.className}>
        {paymentStatus[payment.status]?.label ?? payment.status}
        {payment.status === "PAID" && <span className="block text-xs text-abu">{payment.online ? payment.type ?? "Midtrans" : "tanpa pembayaran online"}</span>}
    </span>
)

const OrderModal = ({ order, onClose }) => (
    <Modal title={`Pesanan ${formatCode(order.id)}`} onClose={onClose}>
        <dl className="grid grid-cols-[130px_1fr] gap-y-2 text-sm">
            <dt className="text-abu">Pembeli</dt><dd>{order.buyer.name} <span className="text-abu">({order.buyer.email})</span></dd>
            <dt className="text-abu">Tanggal</dt><dd>{formatDateTime(new Date(order.createdAt))}</dd>
            <dt className="text-abu">Pembayaran</dt><dd><PaymentLabel payment={order.payment} /></dd>
            <dt className="text-abu">Pengiriman</dt><dd>{deliveryLabel(order.delivery.method)} · {order.delivery.phone}{order.delivery.address && ` · ${order.delivery.address}`}</dd>
            <dt className="text-abu">Total</dt><dd className="font-medium">{formatRupiah(order.total)}{order.shippingFee > 0 && <span className="font-normal text-abu"> (ongkos antar {formatRupiah(order.shippingFee)})</span>}</dd>
        </dl>
        <ul className="mt-4 divide-y divide-line border-y border-line text-sm">
            {order.items.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span>
                        {item.name}{item.variant && <span className="text-abu"> · {item.variant}</span>} × {item.quantity}
                        <span className="block text-xs text-abu">Seller: {item.seller ?? "–"} · potongan {formatRupiah(item.platformFee)}</span>
                    </span>
                    <span className="text-right">
                        {formatRupiah(item.price * item.quantity)}
                        <span className="block"><StatusBadge status={item.status} statuses={orderStatus} /></span>
                    </span>
                </li>
            ))}
        </ul>
        {order.refunds.length > 0 && (
            <div className="mt-4 text-sm">
                <p className="mb-1 font-medium">Refund</p>
                {order.refunds.map((refund) => (
                    <p key={refund.id} className="flex flex-wrap items-center gap-2">
                        {formatRupiah(refund.amount)} · {refund.description} <StatusBadge status={refund.status} statuses={refundStatus} />
                    </p>
                ))}
            </div>
        )}
    </Modal>
)

// Semua pesanan (admin): status pembayaran, item per seller, dan refund
const Orders = () => {
    const [filter, setFilter] = useState(undefined)
    const [page, setPage] = useState(1)
    const [selected, setSelected] = useState(null)
    const { data, isPending, isError, error, refetch } = useAdminOrders({ payment: filter, page })

    const columns = [
        { key: "id", header: "Order ID", className: "text-abu", render: (order) => formatCode(order.id) },
        { key: "buyer", header: "Pembeli", className: "font-medium", render: (order) => order.buyer.name },
        { key: "createdAt", header: "Tanggal", className: "text-abu", render: (order) => formatDateTime(new Date(order.createdAt)) },
        { key: "total", header: "Total", className: "whitespace-nowrap", render: (order) => formatRupiah(order.total) },
        { key: "payment", header: "Pembayaran", render: (order) => <PaymentLabel payment={order.payment} /> },
        {
            key: "items",
            header: "Item",
            render: (order) => {
                const done = order.items.filter((item) => item.status === "DONE").length
                const pendingRefund = order.refunds.some((refund) => refund.status === "PENDING")
                return (
                    <span className="text-sm">
                        {done}/{order.items.length} selesai
                        {pendingRefund && <span className="block text-xs font-medium text-amber-700">Refund menunggu</span>}
                    </span>
                )
            },
        },
        {
            key: "actions",
            header: "Aksi",
            render: (order) => <button type="button" onClick={() => setSelected(order)} className="cursor-pointer text-sm font-medium text-button hover:underline">Detail</button>,
        },
    ]

    return (
        <section>
            <PageTitle>Pesanan</PageTitle>
            <div className="mb-4 flex flex-wrap gap-2" role="tablist">
                {filters.map((option) => (
                    <button
                        key={option.label}
                        type="button"
                        role="tab"
                        aria-selected={filter === option.value}
                        onClick={() => { setFilter(option.value); setPage(1) }}
                        className={`cursor-pointer rounded-full px-4 py-1.5 text-sm ${filter === option.value ? "bg-button text-white" : "bg-white text-[#555] hover:text-button"}`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            {isPending ? <Loading /> : isError ? <ErrorMessage error={error} onRetry={refetch} /> : (
                <>
                    <DataTable columns={columns} rows={data.orders} emptyText="Belum ada pesanan." />
                    <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
                </>
            )}
            {selected && <OrderModal order={selected} onClose={() => setSelected(null)} />}
        </section>
    )
}

export default Orders
