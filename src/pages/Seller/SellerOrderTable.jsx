import { useState } from "react"
import DataTable from "../../components/admin/DataTable"
import IconButton from "../../components/admin/IconButton"
import Modal from "../../components/admin/Modal"
import Button from "../../components/ui/Button"
import { EditIcon, EyeIcon, TrashIcon } from "../../components/ui/icons"
import { useUpdateOrderItemStatus } from "../../api/seller"
import { nextStatuses, orderStatus } from "../../constants/orders"
import { formatCode, formatRupiah, formatShortDate } from "../../utils/format"
import { deliveryLabel } from "../../constants/shop"

// 0812-3456 -> 62812... untuk link WhatsApp
const waNumber = (phone) => phone.replace(/^\+/, "").replace(/^0/, "62")

const StatusText = ({ status }) => (
    <span className={`font-semibold ${status === "CANCELLED" ? "text-abu line-through" : "text-black"}`}>{orderStatus[status]?.label ?? status}</span>
)

const DetailModal = ({ row, onClose }) => (
    <Modal title={`Pesanan ${formatCode(row.orderId)}`} onClose={onClose}>
        <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
            <dt className="text-abu">Produk</dt><dd className="font-medium">{row.name}</dd>
            {row.variant && <><dt className="text-abu">Variasi</dt><dd>{row.variant}</dd></>}
            <dt className="text-abu">Jumlah</dt><dd>{row.quantity} × {formatRupiah(row.price)}</dd>
            <dt className="text-abu">Total</dt><dd className="font-semibold">{formatRupiah(row.price * row.quantity)}</dd>
            <dt className="text-abu">Tanggal</dt><dd>{formatShortDate(new Date(row.createdAt))}</dd>
            <dt className="text-abu">Kustomer</dt><dd>{row.buyer.name}</dd>
            <dt className="text-abu">Email</dt><dd><a href={`mailto:${row.buyer.email}`} className="text-button hover:underline">{row.buyer.email}</a></dd>
            <dt className="text-abu">Status</dt><dd><StatusText status={row.status} /></dd>
        </dl>
        {row.delivery && (
            <dl className="mt-5 grid grid-cols-[120px_1fr] gap-y-2 border-t border-line pt-4 text-sm">
                <dt className="text-abu">Pengiriman</dt><dd className="font-medium">{deliveryLabel(row.delivery.method)}</dd>
                <dt className="text-abu">Penerima</dt><dd>{row.delivery.recipientName}</dd>
                <dt className="text-abu">HP / WA</dt>
                <dd>
                    {row.delivery.phone}{" "}
                    <a href={`https://wa.me/${waNumber(row.delivery.phone)}`} target="_blank" rel="noopener noreferrer" className="text-button hover:underline">Chat WhatsApp</a>
                </dd>
                {row.delivery.address && <><dt className="text-abu">Titik temu</dt><dd className="whitespace-pre-line">{row.delivery.address}</dd></>}
                {row.delivery.note && <><dt className="text-abu">Catatan</dt><dd className="whitespace-pre-line">{row.delivery.note}</dd></>}
            </dl>
        )}
    </Modal>
)

// Ubah status: hanya pilihan yang diizinkan dari status sekarang (maju, atau batal sebelum dikirim)
const StatusModal = ({ row, onClose }) => {
    const updateStatus = useUpdateOrderItemStatus()
    const options = nextStatuses(row.status).filter((status) => status !== "CANCELLED")
    const [status, setStatus] = useState(options[0] ?? "")
    const [error, setError] = useState("")

    const handleSubmit = (event) => {
        event.preventDefault()
        updateStatus.mutate({ id: row.id, status }, { onSuccess: onClose, onError: (requestError) => setError(requestError.message) })
    }

    return (
        <Modal title={`Ubah status ${formatCode(row.orderId)}`} onClose={onClose}>
            {options.length === 0 ? (
                <p className="text-sm text-abu">Status <StatusText status={row.status} /> sudah final.</p>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <p className="text-sm text-abu">{row.name} · status sekarang <StatusText status={row.status} /></p>
                    <label className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                        Status baru
                        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded border border-[#adadad] bg-white px-3 text-sm text-[#333] outline-none focus:border-button">
                            {options.map((option) => <option key={option} value={option}>{orderStatus[option].label}</option>)}
                        </select>
                    </label>
                    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                    <Button type="submit" disabled={updateStatus.isPending} className="self-end rounded-md px-6 py-2 text-sm disabled:cursor-wait disabled:opacity-60">
                        {updateStatus.isPending ? "Menyimpan..." : "Simpan"}
                    </Button>
                </form>
            )}
        </Modal>
    )
}

const SellerOrderTable = ({ rows, emptyText = "Belum ada pesanan masuk." }) => {
    const updateStatus = useUpdateOrderItemStatus()
    const [detail, setDetail] = useState(null)
    const [editing, setEditing] = useState(null)

    // ikon hapus = batalkan pesanan (hanya sebelum dikirim); stok kembali otomatis
    const handleCancel = (row) => {
        if (window.confirm(`Batalkan pesanan ${formatCode(row.orderId)} (${row.name})? Stok dikembalikan dan dana pembeli dikembalikan oleh admin.`)) {
            updateStatus.mutate({ id: row.id, status: "CANCELLED" }, { onError: (error) => window.alert(error.message) })
        }
    }

    const columns = [
        { key: "orderId", header: "Order ID", className: "text-abu", render: (row) => formatCode(row.orderId) },
        { key: "name", header: "Produk", className: "max-w-48 truncate font-medium" },
        { key: "quantity", header: "Qty" },
        { key: "createdAt", header: "Tanggal", className: "text-abu", render: (row) => formatShortDate(new Date(row.createdAt)) },
        { key: "buyer", header: "Nama Kustomer", className: "text-abu", render: (row) => row.buyer.name },
        { key: "total", header: "Total", className: "whitespace-nowrap text-abu", render: (row) => formatRupiah(row.price * row.quantity) },
        { key: "status", header: "Status", render: (row) => <StatusText status={row.status} /> },
        {
            key: "actions",
            header: "Aksi",
            className: "whitespace-nowrap",
            render: (row) => {
                const canCancel = nextStatuses(row.status).includes("CANCELLED")
                return (
                    <div className="flex items-center gap-2">
                        <IconButton label={`Lihat pesanan ${formatCode(row.orderId)}`} onClick={() => setDetail(row)}><EyeIcon className="h-5 w-5" /></IconButton>
                        <IconButton label={`Ubah status ${formatCode(row.orderId)}`} onClick={() => setEditing(row)}><EditIcon className="h-5 w-5" /></IconButton>
                        <IconButton
                            label={`Batalkan pesanan ${formatCode(row.orderId)}`}
                            disabled={!canCancel || updateStatus.isPending}
                            onClick={() => handleCancel(row)}
                            className="disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <TrashIcon className="h-5 w-5" />
                        </IconButton>
                    </div>
                )
            },
        },
    ]

    return (
        <>
            <DataTable columns={columns} rows={rows} rowKey="rowId" emptyText={emptyText} />
            {detail && <DetailModal row={detail} onClose={() => setDetail(null)} />}
            {editing && <StatusModal key={editing.rowId} row={editing} onClose={() => setEditing(null)} />}
        </>
    )
}

export default SellerOrderTable
