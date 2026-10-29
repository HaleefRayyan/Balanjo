import { useState } from "react"
import { Link } from "react-router-dom"
import DataTable from "../../../components/admin/DataTable"
import IconButton from "../../../components/admin/IconButton"
import Modal from "../../../components/admin/Modal"
import PageTitle from "../../../components/admin/PageTitle"
import { EyeIcon } from "../../../components/ui/icons"
import { bannerRequests, bannerStatuses } from "../../../data/banners"

const BannerRequests = () => {
    const [requests, setRequests] = useState(bannerRequests)
    const [preview, setPreview] = useState(null)

    const handleStatus = (id, status) => {
        setRequests((current) => current.map((item) => (item.id === id ? { ...item, status } : item)))
    }

    const columns = [
        { key: "no", header: "No", className: "text-abu", render: (_, index) => index + 1 },
        { key: "product", header: "Produk", className: "max-w-48 truncate font-medium" },
        { key: "seller", header: "Seller", className: "font-medium" },
        { key: "date", header: "Tanggal", className: "text-abu" },
        {
            key: "status",
            header: "Status",
            render: (request) => (
                <select
                    aria-label={`Status banner ${request.seller}`}
                    value={request.status}
                    onChange={(event) => handleStatus(request.id, event.target.value)}
                    className={`cursor-pointer rounded border border-transparent bg-transparent py-1 pr-2 font-medium outline-none hover:border-line focus:border-button
                        ${request.status === "Disetujui" ? "text-green-700" : request.status === "Ditolak" ? "text-red-600" : "text-black"}`}
                >
                    <option value="">-</option>
                    {bannerStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
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
            <DataTable columns={columns} rows={requests} emptyText="Belum ada pengajuan banner." />

            {preview && (
                <Modal title={`Banner dari ${preview.seller}`} onClose={() => setPreview(null)}>
                    <img src={preview.image} alt={`Banner ${preview.product}`} className="w-full rounded" />
                    <p className="mt-4 text-sm text-abu">
                        Produk:{" "}
                        <Link to={`/e-commerce/product/${preview.productId}`} target="_blank" className="text-button hover:underline">
                            {preview.product}
                        </Link>
                        {" · "}Diajukan {preview.date}
                    </p>
                </Modal>
            )}
        </section>
    )
}

export default BannerRequests
