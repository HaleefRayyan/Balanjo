import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { useProduct } from "../../api/products"
import { useSaveProduct } from "../../api/seller"
import { useAuth } from "../../context/auth"
import { productCategories } from "../../constants/categories"
import NotFound from "../NotFound"
import { formatCode } from "../../utils/format"
import { compressImage } from "../../utils/image"

const fieldClass = "rounded border border-[#adadad] px-3 text-sm text-[#333] outline-none focus:border-button"
const labelClass = "flex flex-col gap-1 text-sm text-[#a6a6a6]"
const MAX_PHOTOS = 5
const MAX_VARIANTS = 10
const MAX_BODY_BYTES = 4 * 1024 * 1024 // batas upload Vercel ~4,5 MB untuk seluruh form

let nextKey = 0
const newKey = () => `k${nextKey++}`

// Foto produk: maks. 5, foto pertama = sampul. Foto lama { url }, foto baru { file, preview }.
const PhotoManager = ({ photos, onChange, onError }) => {
    const [busy, setBusy] = useState(false)

    const handleFiles = async (event) => {
        const files = [...event.target.files]
        event.target.value = ""
        if (photos.length + files.length > MAX_PHOTOS) onError(`Maksimal ${MAX_PHOTOS} foto per produk.`)
        setBusy(true)
        const added = await Promise.all(files.slice(0, MAX_PHOTOS - photos.length).map(async (original) => {
            const file = await compressImage(original)
            return { key: newKey(), file, preview: URL.createObjectURL(file) }
        }))
        setBusy(false)
        onChange([...photos, ...added])
    }

    const makeCover = (index) => onChange([photos[index], ...photos.filter((_, i) => i !== index)])
    const remove = (index) => onChange(photos.filter((_, i) => i !== index))

    return (
        <div className="flex flex-col gap-2 text-sm text-[#a6a6a6]">
            <span>Foto ({photos.length}/{MAX_PHOTOS}) · foto pertama jadi sampul</span>
            <ul className="flex flex-wrap gap-3">
                {photos.map((photo, index) => (
                    <li key={photo.key} className="relative h-28 w-28 overflow-hidden rounded border border-[#e0e0e0]">
                        <img src={photo.preview ?? photo.url} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
                        {index === 0
                            ? <span className="absolute bottom-0 left-0 right-0 bg-button/90 py-0.5 text-center text-[11px] text-white">Sampul</span>
                            : (
                                <button type="button" onClick={() => makeCover(index)} className="absolute bottom-0 left-0 right-0 cursor-pointer bg-black/50 py-0.5 text-[11px] text-white hover:bg-black/70">
                                    Jadikan sampul
                                </button>
                            )}
                        <button type="button" aria-label={`Hapus foto ${index + 1}`} onClick={() => remove(index)} className="absolute right-1 top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white/90 text-base leading-none text-red-600 shadow hover:bg-white">
                            ×
                        </button>
                    </li>
                ))}
                {photos.length < MAX_PHOTOS && (
                    <li>
                        <label className={`flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded border border-dashed border-[#adadad] text-xs text-[#777] hover:border-button hover:text-button ${busy ? "opacity-60" : ""}`}>
                            <span className="text-2xl leading-none">+</span>
                            {busy ? "Memproses..." : "Tambah foto"}
                            <input name="photos" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" aria-label="Tambah foto" onChange={handleFiles} disabled={busy} className="sr-only" />
                        </label>
                    </li>
                )}
            </ul>
        </div>
    )
}

// Variasi dengan stok masing-masing; tanpa variasi cukup satu angka stok
const VariantEditor = ({ hasVariants, onToggle, variants, onChange, defaultStock }) => {
    const update = (key, changes) => onChange(variants.map((variant) => (variant.key === key ? { ...variant, ...changes } : variant)))
    const total = variants.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0)

    return (
        <div className="flex flex-col gap-3">
            <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-[#555]">
                <input type="checkbox" checked={hasVariants} onChange={(event) => onToggle(event.target.checked)} className="h-4 w-4 accent-button" />
                Produk ini punya variasi (warna, ukuran, rasa, ...)
            </label>
            {!hasVariants ? (
                <label className={`${labelClass} sm:w-1/3`}>
                    Stok
                    <input name="stock" type="number" required min={0} max={100000} step={1} defaultValue={defaultStock} className={`h-11 ${fieldClass}`} />
                </label>
            ) : (
                <div className="flex flex-col gap-2">
                    {variants.map((variant, index) => (
                        <div key={variant.key} className="flex items-center gap-2">
                            <input
                                aria-label={`Nama variasi ${index + 1}`}
                                required
                                maxLength={30}
                                value={variant.name}
                                onChange={(event) => update(variant.key, { name: event.target.value })}
                                placeholder="Nama variasi, mis. Hitam"
                                className={`h-10 flex-1 ${fieldClass}`}
                            />
                            <input
                                aria-label={`Stok variasi ${index + 1}`}
                                type="number"
                                required
                                min={0}
                                max={100000}
                                step={1}
                                value={variant.stock}
                                onChange={(event) => update(variant.key, { stock: event.target.value })}
                                placeholder="Stok"
                                className={`h-10 w-28 ${fieldClass}`}
                            />
                            <button
                                type="button"
                                aria-label={`Hapus variasi ${index + 1}`}
                                disabled={variants.length === 1}
                                onClick={() => onChange(variants.filter((item) => item.key !== variant.key))}
                                className="h-10 w-10 cursor-pointer rounded border border-[#adadad] text-lg text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    <div className="flex items-center justify-between text-sm">
                        {variants.length < MAX_VARIANTS
                            ? <button type="button" onClick={() => onChange([...variants, { key: newKey(), name: "", stock: "" }])} className="cursor-pointer text-button hover:underline">+ Tambah variasi</button>
                            : <span className="text-abu">Maksimal {MAX_VARIANTS} variasi</span>}
                        <span className="text-[#555]">Total stok: {total}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

// product kosong = tambah produk baru
const ProductForm = ({ product }) => {
    const isNew = !product
    const navigate = useNavigate()
    const saveProduct = useSaveProduct()
    const [photos, setPhotos] = useState(() => (product?.photos ?? []).map((url) => ({ key: newKey(), url })))
    const [hasVariants, setHasVariants] = useState(Boolean(product?.variants.length))
    const [variants, setVariants] = useState(() => (product?.variants.length
        ? product.variants.map((name) => ({ key: newKey(), name, stock: String(product.variantStock[name] ?? 0) }))
        : [{ key: newKey(), name: "", stock: "" }]))
    const [error, setError] = useState("")

    const handleSubmit = (event) => {
        event.preventDefault()
        if (photos.length === 0) return setError("Foto produk wajib diunggah.")
        const names = variants.map((variant) => variant.name.trim().toLowerCase())
        if (hasVariants && new Set(names).size !== names.length) return setError("Nama variasi tidak boleh sama.")

        const formData = new FormData(event.currentTarget)
        formData.delete("photos")
        const fresh = photos.filter((photo) => photo.file)
        if (fresh.reduce((sum, photo) => sum + photo.file.size, 0) > MAX_BODY_BYTES) {
            return setError("Total ukuran foto baru terlalu besar (maks. 4 MB). Kurangi jumlah atau ukuran foto.")
        }
        fresh.forEach((photo) => formData.append("photos", photo.file))
        formData.set("photoOrder", JSON.stringify(photos.map((photo) => (photo.file ? `new:${fresh.indexOf(photo)}` : photo.url))))
        formData.set("variants", JSON.stringify(hasVariants ? variants.map((variant) => ({ name: variant.name.trim(), stock: Number(variant.stock) })) : []))
        if (hasVariants) formData.set("stock", "0")

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

            {/* urutan field mengikuti desain; Kategori, Variasi & beberapa foto tambahan yang dibutuhkan toko */}
            <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-lg bg-white px-5 py-7 sm:px-8">
                <label className={labelClass}>
                    Produk ID
                    <input value={isNew ? "Dibuat otomatis" : formatCode(product.id)} disabled className={`h-11 bg-[#d9d9d9] ${fieldClass}`} />
                </label>

                <label className={labelClass}>
                    Nama Produk
                    <input name="name" required maxLength={100} defaultValue={product?.name} className={`h-11 ${fieldClass}`} />
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
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

                <VariantEditor
                    hasVariants={hasVariants}
                    onToggle={setHasVariants}
                    variants={variants}
                    onChange={setVariants}
                    defaultStock={product && !product.variants.length ? product.stock : 1}
                />

                <PhotoManager photos={photos} onChange={(next) => { setPhotos(next); setError("") }} onError={setError} />

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
