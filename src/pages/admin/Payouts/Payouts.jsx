import { useState } from "react"
import DataTable from "../../../components/admin/DataTable"
import Modal from "../../../components/admin/Modal"
import PageTitle from "../../../components/admin/PageTitle"
import Button from "../../../components/ui/Button"
import StatusBadge from "../../../components/ui/StatusBadge"
import { ErrorMessage, Loading } from "../../../components/ui/Status"
import { useAdminPayouts, usePayoutSellerSummary, useProcessPayout } from "../../../api/admin"
import { payoutStatus } from "../../../constants/shop"
import { formatDateTime, formatRupiah } from "../../../utils/format"

const filters = [
    { value: "PENDING", label: "Menunggu" },
    { value: undefined, label: "Semua" },
]

// Detail pengajuan + saldo seller untuk dicek, lalu tandai sudah ditransfer / tolak
const ProcessModal = ({ payout, onClose }) => {
    const summary = usePayoutSellerSummary(payout.id)
    const processPayout = useProcessPayout()
    const [note, setNote] = useState("")
    const [error, setError] = useState("")
    const pending = payout.status === "PENDING"

    const submit = (status) => {
        if (status === "REJECTED" && !note.trim()) return setError("Tulis alasan penolakan.")
        processPayout.mutate({ id: payout.id, status, note: note.trim() || undefined }, {
            onSuccess: onClose,
            onError: (requestError) => setError(requestError.message),
        })
    }

    const rows = [
        ["Seller", <>{payout.seller.name} <span className="text-abu">({payout.seller.email})</span></>],
        ["Jumlah", <span className="text-lg font-semibold">{formatRupiah(payout.amount)}</span>],
        ["Tujuan", payout.method],
        ["No. rekening / HP", <span className="font-mono">{payout.accountNumber}</span>],
        ["Atas nama", payout.accountName],
        ["Diajukan", formatDateTime(new Date(payout.createdAt))],
        ["Status", <StatusBadge status={payout.status} statuses={payoutStatus} />],
        ...(payout.adminNote ? [["Catatan", payout.adminNote]] : []),
    ]

    return (
        <Modal title={`Payout #${payout.id}`} onClose={onClose}>
            <dl className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
                {rows.map(([label, value]) => (
                    <div key={label} className="contents"><dt className="text-abu">{label}</dt><dd>{value}</dd></div>
                ))}
            </dl>
            {pending && (
                <>
                    <div className="mt-4 rounded bg-text px-4 py-3 text-sm">
                        {summary.isPending ? "Memuat saldo seller..." : summary.isError ? "Saldo seller tidak bisa dimuat." : (
                            <>Penghasilan selesai {formatRupiah(summary.data.earned)} · sudah ditarik {formatRupiah(summary.data.withdrawn)} · sisa setelah pengajuan ini {formatRupiah(summary.data.balance)}</>
                        )}
                    </div>
                    <label className="mt-4 flex flex-col gap-1 text-sm text-[#666]">
                        Catatan (no. referensi transfer, atau alasan ditolak)
                        <input value={note} onChange={(event) => setNote(event.target.value)} maxLength={300} className="h-10 rounded border border-[#adadad] px-3 text-[#333] outline-none focus:border-button" />
                    </label>
                    {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
                    <p className="mt-3 text-xs text-abu">Transfer manual dulu ke rekening di atas, baru tandai sudah ditransfer.</p>
                    <div className="mt-4 flex flex-wrap justify-end gap-3">
                        <button type="button" disabled={processPayout.isPending} onClick={() => submit("REJECTED")} className="cursor-pointer rounded-md border border-red-600 px-5 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50">
                            Tolak
                        </button>
                        <Button disabled={processPayout.isPending} onClick={() => submit("PAID")} className="rounded-md px-5 py-2 text-sm disabled:opacity-50">
                            Tandai sudah ditransfer
                        </Button>
                    </div>
                </>
            )}
        </Modal>
    )
}

const Payouts = () => {
    const [filter, setFilter] = useState("PENDING")
    const { data: payouts, isPending, isError, error, refetch } = useAdminPayouts(filter)
    const [selected, setSelected] = useState(null)

    const columns = [
        { key: "createdAt", header: "Tanggal", className: "text-abu", render: (payout) => formatDateTime(new Date(payout.createdAt)) },
        { key: "seller", header: "Seller", className: "font-medium", render: (payout) => payout.seller.name },
        { key: "amount", header: "Jumlah", className: "whitespace-nowrap", render: (payout) => formatRupiah(payout.amount) },
        { key: "account", header: "Tujuan", render: (payout) => <>{payout.method} · {payout.accountNumber}<span className="block text-xs text-abu">a.n. {payout.accountName}</span></> },
        { key: "status", header: "Status", render: (payout) => <StatusBadge status={payout.status} statuses={payoutStatus} /> },
        {
            key: "actions",
            header: "Aksi",
            render: (payout) => (
                <button type="button" onClick={() => setSelected(payout)} className="cursor-pointer text-sm font-medium text-button hover:underline">
                    {payout.status === "PENDING" ? "Proses" : "Detail"}
                </button>
            ),
        },
    ]

    return (
        <section>
            <PageTitle>Payout Seller</PageTitle>
            <p className="-mt-4 mb-6 text-sm text-abu">Seller menarik saldo penjualan (setelah potongan platform). Transfer manual, lalu tandai sudah ditransfer.</p>
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
                <DataTable columns={columns} rows={payouts} emptyText={filter === "PENDING" ? "Tidak ada pengajuan yang menunggu." : "Belum ada pengajuan payout."} />
            )}
            {selected && <ProcessModal key={selected.id} payout={selected} onClose={() => setSelected(null)} />}
        </section>
    )
}

export default Payouts
