import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import ECommerceComp from "../../components/sections/ECommerceComp"
import { ProductSearch } from "../../components/sections/ProductList"
import Button from "../../components/ui/Button"
import QuantityInput from "../../components/ui/QuantityInput"
import { useProduct, useProducts } from "../../api/products"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { useCart } from "../../context/cart"
import { formatRupiah } from "../../utils/format"
import NotFound from "../NotFound"

// Dipisah dan diberi key={product.id} supaya variasi & jumlah kembali ke awal saat pindah produk
const ProductDetail = ({ product }) => {
    const { addItem } = useCart()
    const [quantity, setQuantity] = useState(1)
    const [variant, setVariant] = useState("")
    const [message, setMessage] = useState(null)
    const recommendations = useProducts({ excludeId: product.id, pageSize: 4 })

    const handleAdd = () => {
        if (product.variants.length > 0 && !variant) {
            setMessage({ type: "error", text: "Pilih variasi dulu ya." })
            return
        }
        addItem(product.id, variant || undefined, quantity)
        setMessage({ type: "success", text: `${quantity} × ${product.name} ditambahkan ke keranjang.` })
    }

    return (
        <main className="mx-auto w-full max-w-[1720px] px-5 pb-20 pt-29 lg:pt-16 sm:px-8 lg:px-[6.5vw]">
            <ProductSearch action="/e-commerce" />

            <section className="mt-10 grid gap-6 rounded-lg bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] sm:p-6 lg:grid-cols-[1.2fr_0.85fr] lg:gap-8">
                <div className="overflow-hidden rounded-md bg-[#f3eef0]">
                    <img src={product.photo} alt={product.name} className="aspect-square h-full w-full object-cover" />
                </div>

                <div className="flex flex-col justify-center py-2 lg:py-6">
                    <h1 className="text-3xl font-semibold leading-tight text-[#2d2d2d] sm:text-4xl">{product.name}</h1>
                    <p className="mt-3 max-w-xl text-xs leading-relaxed text-abu">{product.description}</p>

                    <div className="mt-4 flex items-center gap-3">
                        <span className="text-xl font-medium">{formatRupiah(product.price)}</span>
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
                                {product.variants.map((option) => <option key={option}>{option}</option>)}
                            </select>
                        </div>
                    )}

                    <QuantityInput className="mt-7 h-11" value={quantity} onChange={setQuantity} />

                    <Button className="mt-3 h-11 w-full rounded-md text-sm" onClick={handleAdd}>Tambah ke Keranjang</Button>

                    {message && (
                        <p role="status" className={`mt-3 text-sm ${message.type === "error" ? "text-red-600" : "text-green-700"}`}>
                            {message.text}
                            {message.type === "success" && <> <Link to="/cart" className="font-medium text-button underline">Lihat keranjang</Link></>}
                        </p>
                    )}
                </div>
            </section>

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
