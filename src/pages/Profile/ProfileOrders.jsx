import { useState } from "react"
import { Link } from "react-router-dom"
import Modal from "../../components/admin/Modal"
import Button from "../../components/ui/Button"
import { StarInput, StarRating } from "../../components/ui/Stars"
import { useCreateReview } from "../../api/reviews"
import DataTable from "../../components/admin/DataTable"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { useCancelOrder, useMyOrders } from "../../api/orders"
import { orderStatus } from "../../constants/orders"
import { formatCode, formatLongDate, formatRupiah } from "../../utils/format"
import ProfileCard from "./ProfileCard"

// Ulasan untuk satu item pesanan yang sudah Selesai
const ReviewModal = ({ item, onClose }) => {
    const createReview = useCreateReview()
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = (event) => {
        event.preventDefault()
        if (!rating) return setError("Pilih rating 1-5 bintang.")
        createReview.mutate({ orderItemId: item.id, rating, comment: comment.trim() }, {
            onSuccess: onClose,
            onError: (requestError) => setError(requestError.message),
        })
    }

    return (
        <Modal title="Beri ulasan" onClose={onClose}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <p className="text-sm text-[#555]">{item.name}{item.variant && <span className="text-abu"> · {item.variant}</span>}</p>
                <StarInput value={rating} onChange={setRating} />
                <label className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                    Ulasan (opsional)
                    <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={4} maxLength={1000} placeholder="Ceritakan pengalamanmu dengan produk ini" className="resize-y rounded border border-[#adadad] p-3 text-sm text-[#333] outline-none focus:border-button" />
                </label>
                {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                <Button type="submit" disabled={createReview.isPending} className="self-end rounded-md px-6 py-2 text-sm disabled:cursor-wait disabled:opacity-60">
                    {createReview.isPending ? "Mengirim..." : "Kirim ulasan"}
                </Button>
            </form>
        </Modal>
    )
}

// Desain: Order ID, Produk, Tanggal, Status, Price — satu baris per produk yang dipesan.
// Tambahan: tombol Batalkan (seluruh pesanan) selama belum ada seller yang memproses.
const ProfileOrders = () => {
    const { data: orders, isPending, isError, error, refetch } = useMyOrders()
    const cancelOrder = useCancelOrder()
    const [reviewing, setReviewing] = useState(null)

    const handleCancel = (order) => {
        if (window.confirm(`Batalkan pesanan ${formatCode(order.id)}?`)) {
            cancelOrder.mutate(order.id, { onError: (requestError) => window.alert(requestError.message) })
        }
    }

    const rows = (orders ?? []).flatMap((order) => order.items.map((item, index) => ({
        ...item,
        rowId: item.id,
        order,
        firstOfOrder: index === 0,
    })))

    const columns = [
        { key: "orderId", header: "Order ID", className: "text-abu", render: (row) => formatCode(row.order.id) },
        {
            key: "name",
            header: "Produk",
            className: "max-w-56",
            render: (row) => row.photo && row.productId
                ? <Link to={`/e-commerce/product/${row.productId}`} className="hover:text-button">{row.name}</Link>
                : <span>{row.name}{!row.photo && <span className="ml-1 text-xs text-abu">(dihapus)</span>}</span>,
        },
        { key: "createdAt", header: "Tanggal", className: "text-abu", render: (row) => formatLongDate(new Date(row.order.createdAt)) },
        {
            key: "status",
            header: "Status",
            render: (row) => (
                <span className="flex flex-col items-start gap-1">
                    <span className={row.status === "CANCELLED" ? "text-abu" : "text-[#333]"}>{orderStatus[row.status]?.label}</span>
                    {row.status === "DONE" && (row.review
                        ? <StarRating value={row.review.rating} className="h-3.5 w-3.5" />
                        : row.productId && (
                            <button type="button" onClick={() => setReviewing(row)} className="cursor-pointer text-xs font-medium text-button hover:underline">
                                Beri ulasan
                            </button>
                        ))}
                    {row.firstOfOrder && row.order.items.every((item) => item.status === "PENDING") && (
                        <button type="button" disabled={cancelOrder.isPending} onClick={() => handleCancel(row.order)} className="cursor-pointer text-xs text-red-600 hover:underline disabled:opacity-50">
                            Batalkan pesanan
                        </button>
                    )}
                </span>
            ),
        },
        { key: "price", header: "Price", className: "whitespace-nowrap", render: (row) => formatRupiah(row.price * row.quantity) },
    ]

    return (
        <ProfileCard title="Riwayat Pesanan">
            {isPending ? <Loading /> : isError ? <ErrorMessage error={error} onRetry={refetch} /> : (
                <DataTable columns={columns} rows={rows} rowKey="rowId" emptyText="Kamu belum punya pesanan." />
            )}
            {reviewing && <ReviewModal key={reviewing.id} item={reviewing} onClose={() => setReviewing(null)} />}
        </ProfileCard>
    )
}

export default ProfileOrders
