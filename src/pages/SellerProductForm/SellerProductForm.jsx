import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { useProduct } from "../../api/products"
import { useSaveProduct } from "../../api/seller"
import { useAuth } from "../../context/auth"
import { productCategories } from "../../constants/categories"
import NotFound from "../NotFound"
import { formatCode } from "../../utils/format"

const fieldClass = "rounded border border-[#adadad] px-3 text-sm text-[#333] outline-none focus:border-button"
const labelClass = "flex flex-col gap-1 text-sm text-[#a6a6a6]"

// product kosong = tambah produk baru
const ProductForm = ({ product }) => {
    const isNew = !product
    const navigate = useNavigate()
    const saveProduct = useSaveProduct()
    const [image, setImage] = useState(null) // { file, preview }
    const [error, setError] = useState("")
    const preview = image?.preview ?? product?.photo

    const handleFile = (event) => {
        const file = event.target.files[0]
        setImage(file ? { file, preview: URL.createObjectURL(file) } : null)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        formData.delete("image")
        if (image) formData.set("image", image.file)
        else if (isNew) {
            setError("Foto produk wajib diunggah.")
            return
        }
        setError("")
        saveProduct.mutate({ id: product?.id, formData }, {
            onSuccess: () => navigate("/seller/products"),
            onError: (requestError) => setError(requestError.message),
        })
    }

    return (
        <section>
            <Link to="/seller/products" className="text-sm text-button hover:underline">← Kembali ke Produk</Link>
            <h1 className="mb-6 mt-3 text-[22px] font-medium text-button">{isNew ? "Tambah Produk" : "Edit Produk"}</h1>

            {/* urutan field mengikuti desain; Kategori & Variasi tambahan yang dibutuhkan toko */}
            <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-lg bg-white px-5 py-7 sm:px-8">
                <label className={labelClass}>
                    Produk ID
                    <input value={isNew ? "Dibuat otomatis" : formatCode(product.id)} disabled className={`h-11 bg-[#d9d9d9] ${fieldClass}`} />
                </label>

                <label className={labelClass}>
                    Nama Produk
                    <input name="name" required maxLength={100} defaultValue={product?.name} className={`h-11 ${fieldClass}`} />
                </label>

                <div className="grid gap-5 sm:grid-cols-3">
                    <label className={labelClass}>
                        Stok
                        <input name="stock" type="number" required min={0} max={100000} step={1} defaultValue={product?.stock ?? 1} className={`h-11 ${fieldClass}`} />
                    </label>
                    <label className={labelClass}>
                        Harga (Rp)
                        <input name="price" type="number" required min={100} max={100000000} step={1} defaultValue={product?.price} className={`h-11 ${fieldClass}`} />
                    </label>
                    <label className={labelClass}>
                        Kategori
                        <select name="category" required defaultValue={product?.category ?? ""} className={`h-11 bg-white ${fieldClass}`}>
                            <option value="" disabled>Pilih kategori</option>
                            {productCategories.map((category) => <option key={category.label}>{category.label}</option>)}
                        </select>
                    </label>
                </div>

                <label className={labelClass}>
                    Deskripsi
                    <textarea name="description" required rows={4} maxLength={2000} defaultValue={product?.description} className={`resize-y py-2 ${fieldClass}`} />
                </label>

                <label className={labelClass}>
                    Variasi (opsional, pisahkan dengan koma)
                    <input name="variants" placeholder="Contoh: Hitam, Coklat, Transparan" defaultValue={product?.variants.join(", ")} className={`h-11 ${fieldClass}`} />
                </label>

                <label className={labelClass}>
                    {isNew ? "Foto" : "Ganti foto (opsional)"}
                    <input
                        name="image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFile}
                        className="w-full rounded border border-[#adadad] text-sm text-[#404040] file:mr-4 file:border-0 file:border-r file:border-[#adadad] file:bg-[#d9d9d9] file:px-3 file:py-2 file:text-sm"
                    />
                </label>
                {preview && <img src={preview} alt="Pratinjau foto produk" className="h-40 w-40 rounded object-cover" />}

                {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            </form>

            <div className="mt-5 flex justify-end gap-3">
                <Link to="/seller/products" className="rounded-md border border-[#adadad] px-5 py-2 text-sm">Batal</Link>
                <button type="submit" form="product-form" disabled={saveProduct.isPending} className="cursor-pointer rounded-md bg-button px-6 py-2 text-sm text-white hover:bg-[#896d26] disabled:cursor-wait disabled:opacity-60">
                    {saveProduct.isPending ? "Menyimpan..." : isNew ? "+ Tambah" : "Simpan"}
                </button>
            </div>
        </section>
    )
}

const EditProduct = ({ id }) => {
    const { user } = useAuth()
    const { data: product, isPending, isError, error, refetch } = useProduct(id)

    if (isPending) return <Loading />
    if (isError && error.status !== 404) return <ErrorMessage error={error} onRetry={refetch} />
    // produk orang lain diperlakukan seperti tidak ada (server juga menolak)
    if (isError || product.sellerId !== user.id) return <NotFound />

    return <ProductForm key={product.id} product={product} />
}

const SellerProductForm = () => {
    const { id } = useParams()
    return id ? <EditProduct id={id} /> : <ProductForm />
}

export default SellerProductForm
