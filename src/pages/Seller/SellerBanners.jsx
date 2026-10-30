import { useState } from "react"
import { Link } from "react-router-dom"
import Button from "../../components/ui/Button"
import StatusBadge from "../../components/ui/StatusBadge"
import { Empty, ErrorMessage, Loading } from "../../components/ui/Status"
import { useCreateBannerRequest, useMyBannerRequests, useMyProducts } from "../../api/seller"
import { bannerRequestStatus } from "../../constants/orders"
import { formatShortDate } from "../../utils/format"

const RequestForm = ({ products }) => {
    const createRequest = useCreateBannerRequest()
    const [productId, setProductId] = useState("")
    const [image, setImage] = useState(null) // { file, preview }
    const [message, setMessage] = useState(null)

    const handleFile = (event) => {
        const file = event.target.files[0]
        setImage(file ? { file, preview: URL.createObjectURL(file) } : null)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        if (!productId || !image) {
            setMessage({ type: "error", text: "Pilih produk dan gambar banner." })
            return
        }
        const formElement = event.currentTarget
        const formData = new FormData()
        formData.set("productId", productId)
        formData.set("image", image.file)
        createRequest.mutate(formData, {
            onSuccess: () => {
                setMessage({ type: "success", text: "Pengajuan terkirim. Admin akan meninjau banner kamu." })
                setProductId("")
                setImage(null)
                formElement.reset()
            },
            onError: (error) => setMessage({ type: "error", text: error.message }),
        })
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] sm:p-6">
            <h2 className="font-semibold">Ajukan banner promosi</h2>
            <p className="-mt-2 text-sm text-abu">Banner yang disetujui admin tampil di slider halaman Get Started. Ukuran yang disarankan 1720 × 600 px.</p>
            <label className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                Produk
                <select
                    value={productId}
                    onChange={(event) => setProductId(event.target.value)}
                    className="h-11 rounded border border-[#adadad] bg-white px-3 text-sm text-[#333] outline-none focus:border-button"
                >
                    <option value="" disabled>Pilih produk</option>
                    {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                Gambar banner
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFile}
                    className="w-full rounded border border-[#adadad] text-sm text-[#404040] file:mr-4 file:border-0 file:border-r file:border-[#adadad] file:bg-[#d9d9d9] file:px-3 file:py-2 file:text-sm"
                />
            </label>
            {image && <img src={image.preview} alt="Pratinjau banner" className="max-h-48 w-full rounded object-cover" />}
            {message && <p role={message.type === "error" ? "alert" : "status"} className={`text-sm ${message.type === "error" ? "text-red-600" : "text-green-700"}`}>{message.text}</p>}
            <Button type="submit" disabled={createRequest.isPending} className="self-end rounded-md px-6 py-2 text-sm disabled:cursor-wait disabled:opacity-60">
                {createRequest.isPending ? "Mengirim..." : "Ajukan"}
            </Button>
        </form>
    )
}

const SellerBanners = () => {
    const products = useMyProducts()
    const requests = useMyBannerRequests()

    if (products.isPending || requests.isPending) return <Loading />
    if (products.isError) return <ErrorMessage error={products.error} onRetry={products.refetch} />
    if (requests.isError) return <ErrorMessage error={requests.error} onRetry={requests.refetch} />

    return (
        <section>
        <h1 className="mb-6 text-[22px] font-medium text-button">Banner Promosi</h1>
        <div className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start">
            {products.data.length === 0 ? (
                <div className="rounded-lg bg-white p-6 text-center text-abu">
                    Tambahkan produk dulu sebelum mengajukan banner.{" "}
                    <Link to="/seller/products/new" className="text-button hover:underline">Tambah produk</Link>
                </div>
            ) : (
                <RequestForm products={products.data} />
            )}

            <section aria-label="Riwayat pengajuan">
                <h2 className="mb-4 font-semibold">Riwayat pengajuan</h2>
                {requests.data.length === 0 ? <Empty text="Belum ada pengajuan banner." /> : (
                    <ul className="space-y-4">
                        {requests.data.map((request) => (
                            <li key={request.id} className="flex flex-col gap-4 rounded-lg bg-white p-4 sm:flex-row sm:items-center">
                                <img src={request.image} alt="" className="h-24 w-full rounded object-cover sm:w-48" />
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium">{request.product?.name}</p>
                                    <p className="text-sm text-abu">Diajukan {formatShortDate(new Date(request.createdAt))}</p>
                                </div>
                                <StatusBadge status={request.status} statuses={bannerRequestStatus} />
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
        </section>
    )
}

export default SellerBanners
