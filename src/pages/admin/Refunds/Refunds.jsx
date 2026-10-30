import { useState } from "react"
import DataTable from "../../../components/admin/DataTable"
import Modal from "../../../components/admin/Modal"
import PageTitle from "../../../components/admin/PageTitle"
import Button from "../../../components/ui/Button"
import StatusBadge from "../../../components/ui/StatusBadge"
import { ErrorMessage, Loading } from "../../../components/ui/Status"
import { useAdminRefunds, useMarkRefunded } from "../../../api/admin"
import { refundStatus } from "../../../constants/shop"
import { formatCode, formatDateTime, formatRupiah } from "../../../utils/format"

const filters = [
    { value: "PENDING", label: "Menunggu" },
    { value: undefined, label: "Semua" },
]

const waNumber = (phone) => phone.replace(/^\+/, "").replace(/^0/, "62")

const RefundModal = ({ refund, onClose }) => {
    const markRefunded = useMarkRefunded()
    const [note, setNote] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = () => {
        markRefunded.mutate({ id: refund.id, note: note.trim() || undefined }, {
            onSuccess: onClose,
            onError: (requestError) => setError(requestError.message),
        })
    }

    return (
        <Modal title={`Refund ${formatCode(refund.orderId)}`} onClose={onClose}>
            <dl className="grid grid-cols-[130px_1fr] gap-y-2 text-sm">
                <dt className="text-abu">Jumlah</dt><dd className="text-lg font-semibold">{formatRupiah(refund.amount)}</dd>
                <dt className="text-abu">Alasan</dt><dd>{refund.description}</dd>
                <dt className="text-abu">Pembeli</dt><dd>{refund.buyer.name} <span className="text-abu">({refund.buyer.email})</span></dd>
                <dt className="text-abu">HP / WA</dt>
                <dd>{refund.buyer.phone} <a href={`https://wa.me/${waNumber(refund.buyer.phone)}`} target="_blank" rel="noreferrer" className="text-button hover:underline">Chat WhatsApp</a></dd>
                <dt className="text-abu">Pembayaran</dt><dd><span className="font-mono">{refund.payment.ref}</span> · {refund.payment.type ?? "–"}</dd>
                <dt className="text-abu">Status</dt><dd><StatusBadge status={refund.status} statuses={refundStatus} /></dd>
                {refund.adminNote && <><dt className="text-abu">Catatan</dt><dd>{refund.adminNote}</dd></>}
            </dl>
            {refund.status === "PENDING" && (
                <>
                    <p className="mt-4 rounded bg-text px-4 py-3 text-xs leading-relaxed text-[#555]">
                        Kartu, GoPay, QRIS, ShopeePay: refund lewat dashboard Midtrans (Transactions → cari order ID di atas → Refund).
                        Virtual account / gerai: hubungi pembeli untuk nomor rekening, lalu transfer manual.
                    </p>
                    <label className="mt-4 flex flex-col gap-1 text-sm text-[#666]">
                        Catatan (mis. no. referensi refund / transfer)
                        <input value={note} onChange={(event) => setNote(event.target.value)} maxLength={300} className="h-10 rounded border border-[#adadad] px-3 text-[#333] outline-none focus:border-button" />
                    </label>
                    {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
                    <div className="mt-4 flex justify-end">
                        <Button disabled={markRefunded.isPending} onClick={handleSubmit} className="rounded-md px-5 py-2 text-sm disabled:opacity-50">
                            Tandai sudah dikembalikan
                        </Button>
                    </div>
                </>
            )}
        </Modal>
    )
}

// Refund ke pembeli: item dibatalkan seller setelah dibayar, atau pembayaran yang masuk terlambat
const Refunds = () => {
    const [filter, setFilter] = useState("PENDING")
    const { data: refunds, isPending, isError, error, refetch } = useAdminRefunds(filter)
    const [selected, setSelected] = useState(null)

    const columns = [
        { key: "createdAt", header: "Tanggal", className: "text-abu", render: (refund) => formatDateTime(new Date(refund.createdAt)) },
        { key: "order", header: "Order ID", className: "text-abu", render: (refund) => formatCode(refund.orderId) },
        { key: "buyer", header: "Pembeli", className: "font-medium", render: (refund) => refund.buyer.name },
        { key: "amount", header: "Jumlah", className: "whitespace-nowrap", render: (refund) => formatRupiah(refund.amount) },
        { key: "description", header: "Alasan", className: "max-w-64 text-sm", render: (refund) => refund.description },
        { key: "status", header: "Status", render: (refund) => <StatusBadge status={refund.status} statuses={refundStatus} /> },
        {
            key: "actions",
            header: "Aksi",
            render: (refund) => (
                <button type="button" onClick={() => setSelected(refund)} className="cursor-pointer text-sm font-medium text-button hover:underline">
                    {refund.status === "PENDING" ? "Proses" : "Detail"}
                </button>
            ),
        },
    ]

    return (
        <section>
            <PageTitle>Refund</PageTitle>
            <p className="-mt-4 mb-6 text-sm text-abu">Dibuat otomatis saat seller membatalkan item yang sudah dibayar, atau pembayaran masuk setelah pesanan ditutup.</p>
            <div className="mb-4 flex gap-2" role="tablist">
                {filters.map((option) => (
                    <button
                        key={option.label}
                        type="button"
                        role="tab"
                        aria-selected={filter === option.value}
                        onClick={() => setFilter(option.value)}
                        className={`cursor-pointer rounded-full px-4 py-1.5 text-sm ${filter === option.value ? "bg-button text-white" : "bg-white text-[#555] hover:text-button"}`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            {isPending ? <Loading /> : isError ? <ErrorMessage error={error} onRetry={refetch} /> : (
                <DataTable columns={columns} rows={refunds} emptyText={filter === "PENDING" ? "Tidak ada refund yang menunggu." : "Belum ada refund."} />
            )}
            {selected && <RefundModal key={selected.id} refund={selected} onClose={() => setSelected(null)} />}
        </section>
    )
}

export default Refunds
