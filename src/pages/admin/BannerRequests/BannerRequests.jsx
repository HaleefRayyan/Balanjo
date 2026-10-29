import { useState } from "react"
import { Link } from "react-router-dom"
import DataTable from "../../../components/admin/DataTable"
import IconButton from "../../../components/admin/IconButton"
import Modal from "../../../components/admin/Modal"
import PageTitle from "../../../components/admin/PageTitle"
import { ErrorMessage, Loading } from "../../../components/ui/Status"
import { EyeIcon } from "../../../components/ui/icons"
import { useBannerRequests, useSetBannerRequestStatus } from "../../../api/banners"
import { formatShortDate } from "../../../utils/format"

// status di API -> label di tabel (desain: "-" / Disetujui / Ditolak)
const statusOptions = [
    { value: "PENDING", label: "-" },
    { value: "APPROVED", label: "Disetujui" },
    { value: "REJECTED", label: "Ditolak" },
]
const statusColor = { APPROVED: "text-green-700", REJECTED: "text-red-600", PENDING: "text-black" }

const BannerRequests = () => {
    const { data: requests, isPending, isError, error, refetch } = useBannerRequests()
    const setStatus = useSetBannerRequestStatus()
    const [preview, setPreview] = useState(null)

    const handleStatus = (id, status) => {
        setStatus.mutate({ id, status }, { onError: (requestError) => window.alert(requestError.message) })
    }

    const columns = [
        { key: "no", header: "No", className: "text-abu", render: (_, index) => index + 1 },
        { key: "product", header: "Produk", className: "max-w-48 truncate font-medium", render: (request) => request.product?.name },
        { key: "seller", header: "Seller", className: "font-medium" },
        { key: "createdAt", header: "Tanggal", className: "text-abu", render: (request) => formatShortDate(new Date(request.createdAt)) },
        {
            key: "status",
            header: "Status",
            render: (request) => (
                <select
                    aria-label={`Status banner ${request.seller}`}
                    value={request.status}
                    disabled={setStatus.isPending}
                    onChange={(event) => handleStatus(request.id, event.target.value)}
                    className={`cursor-pointer rounded border border-transparent bg-transparent py-1 pr-2 font-medium outline-none hover:border-line focus:border-button disabled:cursor-wait ${statusColor[request.status]}`}
                >
                    {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
            ),
        },
        {
            key: "actions",
            header: "Aksi",
            render: (request) => (
                <IconButton label="Lihat banner" onClick={() => setPreview(request)}>
                    <EyeIcon className="h-7 w-7" />
                </IconButton>
            ),
        },
    ]

    return (
        <section>
            <PageTitle>Kelola Banner E-Commerce</PageTitle>
            <p className="-mt-4 mb-6 text-sm text-abu">Pengajuan yang <strong>Disetujui</strong> otomatis tampil di slider halaman Get Started.</p>
            {isPending ? <Loading /> : isError ? <ErrorMessage error={error} onRetry={refetch} /> : (
                <DataTable columns={columns} rows={requests} emptyText="Belum ada pengajuan banner." />
            )}

            {preview && (
                <Modal title={`Banner dari ${preview.seller}`} onClose={() => setPreview(null)}>
                    <img src={preview.image} alt={`Banner ${preview.product?.name}`} className="w-full rounded" />
                    <p className="mt-4 text-sm text-abu">
                        Produk:{" "}
                        <Link to={`/e-commerce/product/${preview.product?.id}`} target="_blank" className="text-button hover:underline">
                            {preview.product?.name}
                        </Link>
                        {" · "}Diajukan {formatShortDate(new Date(preview.createdAt))}
                    </p>
                </Modal>
            )}
        </section>
    )
}

export default BannerRequests
