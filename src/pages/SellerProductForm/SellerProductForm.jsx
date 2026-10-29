import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { useProduct } from "../../api/products"
import { useSaveProduct } from "../../api/seller"
import { useAuth } from "../../context/auth"
import { productCategories } from "../../constants/categories"
import NotFound from "../NotFound"

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
            onSuccess: () => navigate("/seller"),
            onError: (requestError) => setError(requestError.message),
        })
    }

    return (
        <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-16 sm:px-8">
            <Link to="/seller" className="text-sm text-button hover:underline">← Kembali ke Toko Saya</Link>
            <h1 className="mt-4 mb-6 text-2xl font-semibold text-button sm:text-3xl">{isNew ? "Tambah Produk" : "Edit Produk"}</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-lg bg-white px-5 py-7 sm:px-8">
                <label className={labelClass}>
                    Nama produk
                    <input name="name" required maxLength={100} defaultValue={product?.name} className={`h-11 ${fieldClass}`} />
                </label>

                <div className="grid gap-6 sm:grid-cols-2">
                    <label className={labelClass}>
                        Kategori
                        <select name="category" required defaultValue={product?.category ?? ""} className={`h-11 bg-white ${fieldClass}`}>
                            <option value="" disabled>Pilih kategori</option>
                            {productCategories.map((category) => <option key={category.label}>{category.label}</option>)}
                        </select>
                    </label>
                    <label className={labelClass}>
                        Harga (Rp)
                        <input name="price" type="number" required min={100} max={100000000} step={1} defaultValue={product?.price} className={`h-11 ${fieldClass}`} />
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
                    {isNew ? "Foto produk" : "Ganti foto (opsional)"}
                    <input
                        name="image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFile}
                        className="w-full rounded border border-[#adadad] text-sm text-[#404040] file:mr-4 file:border-0 file:border-r file:border-[#adadad] file:bg-[#d9d9d9] file:px-3 file:py-2 file:text-sm"
                    />
                </label>
                {preview && <img src={preview} alt="Pratinjau foto produk" className="h-48 w-48 rounded object-cover" />}

                {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

                <div className="flex justify-end gap-3">
                    <Link to="/seller" className="rounded-md border border-[#adadad] px-5 py-2 text-sm">Batal</Link>
                    <button type="submit" disabled={saveProduct.isPending} className="cursor-pointer rounded-md bg-button px-6 py-2 text-sm text-white hover:bg-[#896d26] disabled:cursor-wait disabled:opacity-60">
                        {saveProduct.isPending ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            </form>
        </main>
    )
}

const EditProduct = ({ id }) => {
    const { user } = useAuth()
    const { data: product, isPending, isError, error, refetch } = useProduct(id)

    if (isPending) return <main className="mx-auto max-w-3xl px-5 pt-16"><Loading /></main>
    if (isError && error.status !== 404) return <main className="mx-auto max-w-3xl px-5 pt-16"><ErrorMessage error={error} onRetry={refetch} /></main>
    // produk orang lain diperlakukan seperti tidak ada (server juga menolak)
    if (isError || product.sellerId !== user.id) return <NotFound />

    return <ProductForm key={product.id} product={product} />
}

const SellerProductForm = () => {
    const { id } = useParams()
    return id ? <EditProduct id={id} /> : <ProductForm />
}

export default SellerProductForm
