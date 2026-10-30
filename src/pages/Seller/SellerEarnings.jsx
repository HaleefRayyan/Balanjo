import { useState } from "react"
import Button from "../../components/ui/Button"
import StatusBadge from "../../components/ui/StatusBadge"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { useRequestPayout, useSavePayoutAccount, useSellerPayouts } from "../../api/seller"
import { orderStatus } from "../../constants/orders"
import { PAYOUT_METHODS, payoutStatus } from "../../constants/shop"
import { formatCode, formatDateTime, formatRupiah } from "../../utils/format"

const card = "rounded-lg bg-white px-6 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
const inputClass = "h-10 w-full rounded border border-[#d0d0d0] bg-white px-3 text-sm text-[#333] outline-none focus:border-button"

const Stat = ({ label, value, hint }) => (
    <div className={card}>
        <p className="text-sm text-[#555]">{label}</p>
        <p className="mt-1 text-[24px] font-medium text-[#333]">{formatRupiah(value)}</p>
        {hint && <p className="mt-1 text-xs text-abu">{hint}</p>}
    </div>
)

// Rekening / e-wallet tujuan. Tampil sebagai ringkasan; tombol Ubah membuka form.
const AccountForm = ({ account }) => {
    const saveAccount = useSavePayoutAccount()
    const [editing, setEditing] = useState(!account)
    const [error, setError] = useState("")

    if (!editing) {
        return (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <p>
                    <span className="font-medium">{account.method}</span> · {account.accountNumber}
                    <span className="block text-abu">a.n. {account.accountName}</span>
                </p>
                <button type="button" onClick={() => setEditing(true)} className="cursor-pointer text-sm text-button hover:underline">Ubah</button>
            </div>
        )
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        saveAccount.mutate(
            { method: form.get("method"), accountNumber: form.get("accountNumber"), accountName: form.get("accountName") },
            { onSuccess: () => { setError(""); setEditing(false) }, onError: (requestError) => setError(requestError.message) },
        )
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs text-[#666]">
                Bank / e-wallet
                <select name="method" required defaultValue={account?.method ?? ""} className={inputClass}>
                    <option value="" disabled>Pilih</option>
                    {PAYOUT_METHODS.map((method) => <option key={method}>{method}</option>)}
                </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-[#666]">
                No. rekening / HP
                <input name="accountNumber" required inputMode="numeric" defaultValue={account?.accountNumber} placeholder="1234567890" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[#666]">
                Nama pemilik
                <input name="accountName" required maxLength={80} defaultValue={account?.accountName} placeholder="Sesuai buku tabungan / akun" className={inputClass} />
            </label>
            {error && <p role="alert" className="text-sm text-red-600 sm:col-span-3">{error}</p>}
            <div className="flex gap-3 sm:col-span-3">
                <Button type="submit" disabled={saveAccount.isPending} className="rounded-md px-5 py-2 text-sm disabled:opacity-60">
                    {saveAccount.isPending ? "Menyimpan..." : "Simpan rekening"}
                </Button>
                {account && <button type="button" onClick={() => setEditing(false)} className="cursor-pointer text-sm text-abu hover:text-black">Batal</button>}
            </div>
        </form>
    )
}

const WithdrawForm = ({ summary, account, hasPending }) => {
    const requestPayout = useRequestPayout()
    const [amount, setAmount] = useState("")
    const [message, setMessage] = useState(null)

    const blocked = !account ? "Isi rekening tujuan dulu."
        : hasPending ? "Pengajuan sebelumnya masih diproses admin."
        : summary.balance < summary.minAmount ? `Saldo minimal untuk ditarik ${formatRupiah(summary.minAmount)}.`
        : null

    const handleSubmit = (event) => {
        event.preventDefault()
        const value = Number(amount || summary.balance)
        requestPayout.mutate(value, {
            onSuccess: () => { setAmount(""); setMessage({ type: "success", text: `Pengajuan ${formatRupiah(value)} terkirim. Admin akan mentransfer ke rekeningmu.` }) },
            onError: (requestError) => setMessage({ type: "error", text: requestError.message }),
        })
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1 text-xs text-[#666]">
                    Jumlah (kosongkan = semua saldo)
                    <input
                        type="number"
                        min={summary.minAmount}
                        max={summary.balance}
                        step={1}
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        placeholder={String(summary.balance)}
                        disabled={Boolean(blocked)}
                        className={`${inputClass} w-56 disabled:bg-[#f4f4f4]`}
                    />
                </label>
                <Button type="submit" disabled={Boolean(blocked) || requestPayout.isPending} className="h-10 rounded-md px-5 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                    {requestPayout.isPending ? "Mengirim..." : "Tarik saldo"}
                </Button>
            </div>
            {blocked && <p className="text-xs text-abu">{blocked}</p>}
            {message && <p role={message.type === "error" ? "alert" : "status"} className={`text-sm ${message.type === "error" ? "text-red-600" : "text-green-700"}`}>{message.text}</p>}
        </form>
    )
}

// Penghasilan dari pesanan yang dibayar online, potongan platform, dan penarikan saldo (payout)
const SellerEarnings = () => {
    const { data, isPending, isError, error, refetch } = useSellerPayouts()

    if (isPending) return <Loading />
    if (isError) return <ErrorMessage error={error} onRetry={refetch} />

    const { summary, account, payouts, entries } = data
    return (
        <section className="flex flex-col gap-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Stat label="Saldo bisa ditarik" value={summary.balance} />
                <Stat label="Dana tertahan" value={summary.pending} hint="Pesanan dibayar, belum Selesai" />
                <Stat label="Sedang diproses" value={summary.requested} hint="Pengajuan penarikan" />
                <Stat label="Total ditarik" value={summary.withdrawn} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <div className={card}>
                    <h2 className="mb-4 text-[16px] font-medium text-button">Rekening tujuan</h2>
                    <AccountForm key={account ? `${account.method}-${account.accountNumber}` : "new"} account={account} />
                </div>
                <div className={card}>
                    <h2 className="mb-4 text-[16px] font-medium text-button">Tarik saldo</h2>
                    <WithdrawForm summary={summary} account={account} hasPending={summary.requested > 0} />
                </div>
            </div>
            <p className="-mt-4 text-xs text-abu">
                Penghasilan = harga × jumlah − potongan platform {summary.feePercent}%, ditambah ongkos antar (utuh untuk seller).
                Saldo bisa ditarik setelah pesanan ditandai Selesai. Hanya pesanan yang dibayar lewat Midtrans yang dihitung.
            </p>

            <div>
                <h1 className="mb-4 text-[18px] font-medium text-button">Riwayat Penarikan</h1>
                <div className="overflow-x-auto rounded-lg bg-white px-4 py-2">
                    <table className="w-full min-w-150 text-left text-sm">
                        <thead><tr className="text-[#555]"><th className="px-4 py-3 font-normal">Tanggal</th><th className="px-4 py-3 font-normal">Jumlah</th><th className="px-4 py-3 font-normal">Tujuan</th><th className="px-4 py-3 font-normal">Status</th><th className="px-4 py-3 font-normal">Catatan admin</th></tr></thead>
                        <tbody>
                            {payouts.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-abu">Belum ada penarikan.</td></tr>}
                            {payouts.map((payout) => (
                                <tr key={payout.id} className="border-t border-line">
                                    <td className="px-4 py-3 text-abu">{formatDateTime(new Date(payout.createdAt))}</td>
                                    <td className="px-4 py-3 font-medium">{formatRupiah(payout.amount)}</td>
                                    <td className="px-4 py-3">{payout.method} · {payout.accountNumber}</td>
                                    <td className="px-4 py-3"><StatusBadge status={payout.status} statuses={payoutStatus} /></td>
                                    <td className="px-4 py-3 text-abu">{payout.adminNote ?? "–"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h1 className="mb-4 text-[18px] font-medium text-button">Rincian Penghasilan</h1>
                <div className="overflow-x-auto rounded-lg bg-white px-4 py-2">
                    <table className="w-full min-w-180 text-left text-sm">
                        <thead><tr className="text-[#555]"><th className="px-4 py-3 font-normal">Order ID</th><th className="px-4 py-3 font-normal">Produk</th><th className="px-4 py-3 font-normal">Penjualan</th><th className="px-4 py-3 font-normal">Potongan</th><th className="px-4 py-3 font-normal">Bersih</th><th className="px-4 py-3 font-normal">Status</th></tr></thead>
                        <tbody>
                            {entries.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-abu">Belum ada penjualan yang dibayar online.</td></tr>}
                            {entries.map((entry, index) => (
                                <tr key={index} className={`border-t border-line ${entry.status === "CANCELLED" ? "text-abu line-through" : ""}`}>
                                    <td className="px-4 py-3 text-abu">{formatCode(entry.orderId)}</td>
                                    <td className="px-4 py-3">{entry.name}{entry.variant && <span className="text-abu"> · {entry.variant}</span>}{entry.quantity > 1 && <span className="text-abu"> × {entry.quantity}</span>}</td>
                                    <td className="px-4 py-3">{formatRupiah(entry.gross)}</td>
                                    <td className="px-4 py-3 text-abu">{entry.fee ? `−${formatRupiah(entry.fee)}` : "–"}</td>
                                    <td className="px-4 py-3 font-medium">{formatRupiah(entry.net)}</td>
                                    <td className="px-4 py-3">{entry.status === "DONE" ? <span className="text-green-700">Bisa ditarik</span> : orderStatus[entry.status]?.label}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    )
}

export default SellerEarnings
