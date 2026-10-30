import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import ECommerceComp from "../../components/sections/ECommerceComp"
import { ProductSearch } from "../../components/sections/ProductList"
import Button from "../../components/ui/Button"
import QuantityInput from "../../components/ui/QuantityInput"
import { useProduct, useProducts } from "../../api/products"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { useCart } from "../../context/cart"
import { useAuth } from "../../context/auth"
import { formatRupiah } from "../../utils/format"
import NotFound from "../NotFound"
import { StarRating } from "../../components/ui/Stars"
import ProductReviews from "./ProductReviews"

// Foto utama + deretan thumbnail (kalau lebih dari satu foto)
const Gallery = ({ photos, name }) => {
    const [active, setActive] = useState(0)
    return (
        <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-md bg-[#f3eef0]">
                <img src={photos[active]} alt={name} className="aspect-square h-full w-full object-cover" />
            </div>
            {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                    {photos.map((photo, index) => (
                        <button
                            key={photo}
                            type="button"
                            aria-label={`Foto ${index + 1}`}
                            aria-pressed={index === active}
                            onClick={() => setActive(index)}
                            className={`h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded border-2 sm:h-20 sm:w-20 ${index === active ? "border-button" : "border-transparent opacity-70 hover:opacity-100"}`}
                        >
                            <img src={photo} alt="" className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// Dipisah dan diberi key={product.id} supaya variasi & jumlah kembali ke awal saat pindah produk
const ProductDetail = ({ product }) => {
    const { addItem } = useCart()
    const { user } = useAuth()
    const isOwnProduct = user && product.sellerId === user.id
    const [quantity, setQuantity] = useState(1)
    const [variant, setVariant] = useState("")
    const [message, setMessage] = useState(null)
    const recommendations = useProducts({ excludeId: product.id, pageSize: 4 })
    // stok yang berlaku: variasi terpilih, atau total produk
    const available = variant ? product.variantStock[variant] ?? 0 : product.stock
    const soldOut = product.stock === 0 || (variant && available === 0)

    const handleAdd = () => {
        if (product.variants.length > 0 && !variant) {
            setMessage({ type: "error", text: "Pilih variasi dulu ya." })
            return
        }
        const amount = Math.min(quantity, available)
        addItem(product.id, variant || undefined, amount)
        setMessage({ type: "success", text: `${amount} × ${product.name} ditambahkan ke keranjang.` })
    }

    return (
        <main className="mx-auto w-full max-w-[1720px] px-5 pb-20 pt-29 lg:pt-16 sm:px-8 lg:px-[6.5vw]">
            <ProductSearch action="/e-commerce" />

            <section className="mt-10 grid gap-6 rounded-lg bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] sm:p-6 lg:grid-cols-[1.2fr_0.85fr] lg:gap-8">
                <Gallery photos={product.photos} name={product.name} />

                <div className="flex flex-col justify-center py-2 lg:py-6">
                    <h1 className="text-3xl font-semibold leading-tight text-[#2d2d2d] sm:text-4xl">{product.name}</h1>
                    {product.seller && (
                        <p className="mt-1 text-sm text-abu">
                            Dijual oleh <Link to={`/e-commerce/seller/${product.sellerId}`} className="font-medium text-[#555] hover:text-button hover:underline">{product.seller}</Link>
                        </p>
                    )}
                    {product.rating.count > 0 && (
                        <a href="#reviews-title" className="mt-2 flex items-center gap-2 text-sm text-[#555] hover:text-button">
                            <StarRating value={product.rating.average} />
                            {product.rating.average} ({product.rating.count} ulasan)
                        </a>
                    )}
                    <p className="mt-3 max-w-xl whitespace-pre-line text-xs leading-relaxed text-abu">{product.description}</p>

                    <div className="mt-4 flex items-center gap-3">
                        <span className="text-xl font-medium">{formatRupiah(product.price)}</span>
                        <span className={`text-sm ${soldOut ? "font-medium text-red-600" : "text-abu"}`}>{soldOut ? "Stok habis" : `Stok: ${available}`}</span>
                    </div>

                    {product.variants.length > 0 && (
                        <div className="mt-6 border-t border-[#eeeeee] pt-5">
                            <label className="text-xs text-[#666]" htmlFor="variant">Variasi</label>
                            <select
                                id="variant"
                                value={variant}
                                onChange={(event) => { setVariant(event.target.value); setMessage(null) }}
                                className="mt-2 h-10 w-full rounded-md border border-[#d7d7d7] bg-white px-3 text-xs text-[#333] outline-none focus:border-button"
                            >
                                <option value="" disabled>Pilih variasi</option>
                                {product.variants.map((option) => {
                                    const left = product.variantStock[option] ?? 0
                                    return <option key={option} value={option} disabled={left === 0}>{option} {left === 0 ? "(habis)" : `(stok ${left})`}</option>
                                })}
                            </select>
                        </div>
                    )}

                    {isOwnProduct ? (
                        <p className="mt-7 rounded-md bg-text px-4 py-3 text-sm text-[#555]">
                            Ini produk tokomu. <Link to={`/seller/products/${product.id}/edit`} className="font-medium text-button underline">Edit produk</Link>
                        </p>
                    ) : (
                        <>
                            <QuantityInput className="mt-7 h-11" value={Math.min(quantity, Math.max(1, available))} onChange={setQuantity} max={Math.max(1, available)} />
                            <Button className="mt-3 h-11 w-full rounded-md text-sm disabled:cursor-not-allowed disabled:opacity-50" onClick={handleAdd} disabled={soldOut}>
                                {soldOut ? "Stok habis" : "Tambah ke Keranjang"}
                            </Button>
                        </>
                    )}

                    {message && (
                        <p role="status" className={`mt-3 text-sm ${message.type === "error" ? "text-red-600" : "text-green-700"}`}>
                            {message.text}
                            {message.type === "success" && <> <Link to="/cart" className="font-medium text-button underline">Lihat keranjang</Link></>}
                        </p>
                    )}
                </div>
            </section>

            <ProductReviews product={product} />

            <section className="mt-10 sm:mt-12">
                <div className="mb-6 flex items-center gap-3 text-button">
                    <span className="h-0.75 w-16 bg-button" />
                    <h2 className="text-xl font-semibold sm:text-2xl">Rekomendasi lainnya</h2>
                </div>
                <ECommerceComp products={recommendations.data?.products ?? null} emptyText="Belum ada rekomendasi." />
            </section>
        </main>
    )
}

const DetailProduct = () => {
    const { id } = useParams()
    const { data: product, isPending, isError, error, refetch } = useProduct(id)

    if (isPending) return <main className="px-5 pt-16 sm:px-8 lg:px-[6.5vw]"><Loading /></main>
    if (isError && error.status === 404) return <NotFound />
    if (isError) return <main className="px-5 pt-16 sm:px-8 lg:px-[6.5vw]"><ErrorMessage error={error} onRetry={refetch} /></main>

    return <ProductDetail key={product.id} product={product} />
}

export default DetailProduct
