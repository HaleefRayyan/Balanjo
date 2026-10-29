import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import Button from "../../components/ui/Button"
import QuantityInput from "../../components/ui/QuantityInput"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { TrashIcon } from "../../components/ui/icons"
import { useCreateOrder, useProducts } from "../../api/products"
import { useAuth } from "../../context/auth"
import { useCart } from "../../context/cart"
import { formatRupiah } from "../../utils/format"

const Cart = () => {
    const { items, count, setQuantity, removeItem, removeProducts, clear } = useCart()
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [order, setOrder] = useState(null)
    const createOrder = useCreateOrder()

    // detail produk (nama, harga, foto) diambil dari API berdasarkan id di keranjang
    const ids = [...new Set(items.map((item) => item.productId))].sort((a, b) => a - b)
    const products = useProducts({ ids: ids.join(",") }, { enabled: ids.length > 0 })
    const byId = new Map((products.data?.products ?? []).map((product) => [product.id, product]))
    const lines = items.filter((item) => byId.has(item.productId)).map((item) => ({ ...item, product: byId.get(item.productId) }))
    const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0)

    // produk yang sudah dihapus seller/admin dibuang dari keranjang
    const missing = products.isSuccess && !products.isPlaceholderData ? ids.filter((id) => !byId.has(id)) : []
    const missingKey = missing.join(",")
    useEffect(() => {
        if (missingKey) removeProducts(missingKey.split(",").map(Number))
    }, [missingKey]) // eslint-disable-line react-hooks/exhaustive-deps -- removeProducts berubah tiap render

    const handleCheckout = () => {
        if (!user) {
            navigate("/login", { state: { from: location } })
            return
        }
        createOrder.mutate(
            items.map(({ productId, variant, quantity }) => ({ productId, variant, quantity })),
            { onSuccess: (created) => { clear(); setOrder(created) } },
        )
    }

    let content
    if (order) {
        content = (
            <div className="rounded-lg bg-white px-6 py-16 text-center">
                <p className="text-xl font-semibold text-[#2d2d2d]">Pesanan #{order.id} berhasil dibuat!</p>
                <p className="mt-2 text-abu">Total {formatRupiah(order.total)}. Seller akan menghubungi kamu untuk konfirmasi pembayaran dan pengiriman.</p>
                <Link to="/e-commerce" className="mt-8 inline-flex rounded-md bg-button px-6 py-3 text-white">Belanja lagi</Link>
            </div>
        )
    } else if (items.length === 0) {
        content = (
            <div className="rounded-lg bg-white px-6 py-16 text-center">
                <p className="text-xl font-semibold text-[#2d2d2d]">Keranjang kamu masih kosong</p>
                <p className="mt-2 text-abu">Yuk, cari produk dari UMKM pilihan Rangers.</p>
                <Link to="/e-commerce" className="mt-8 inline-flex rounded-md bg-button px-6 py-3 text-white">Belanja sekarang</Link>
            </div>
        )
    } else if (products.isPending) {
        content = <Loading />
    } else if (products.isError) {
        content = <ErrorMessage error={products.error} onRetry={products.refetch} />
    } else {
        content = (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
                <ul className="space-y-4">
                    {lines.map((line) => (
                        <li key={line.key} className="flex gap-4 rounded-lg bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                            <Link to={`/e-commerce/product/${line.productId}`} className="shrink-0">
                                <img src={line.product.photo} alt={line.product.name} className="h-24 w-24 rounded-md object-cover sm:h-28 sm:w-28" />
                            </Link>
                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <Link to={`/e-commerce/product/${line.productId}`} className="font-medium text-[#2d2d2d] hover:text-button">{line.product.name}</Link>
                                        {line.variant && <p className="text-sm text-abu">Variasi: {line.variant}</p>}
                                    </div>
                                    <button type="button" aria-label={`Hapus ${line.product.name}`} className="cursor-pointer rounded-md p-1 text-button hover:bg-button/10" onClick={() => removeItem(line.key)}>
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                                    <QuantityInput className="h-9 w-32" value={line.quantity} onChange={(quantity) => setQuantity(line.key, quantity)} />
                                    <span className="font-semibold">{formatRupiah(line.product.price * line.quantity)}</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>

                <aside className="rounded-lg bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                    <h2 className="text-lg font-semibold">Ringkasan Belanja</h2>
                    <div className="mt-4 flex justify-between text-sm text-abu">
                        <span>Total item</span>
                        <span>{count}</span>
                    </div>
                    <div className="mt-2 flex justify-between border-t border-line pt-4 text-lg font-semibold">
                        <span>Subtotal</span>
                        <span>{formatRupiah(subtotal)}</span>
                    </div>
                    {createOrder.isError && <p role="alert" className="mt-4 text-sm text-red-600">{createOrder.error.message}</p>}
                    <Button className="mt-6 h-11 w-full rounded-md text-sm disabled:cursor-wait disabled:opacity-60" onClick={handleCheckout} disabled={createOrder.isPending}>
                        {createOrder.isPending ? "Memproses..." : user ? "Checkout" : "Login untuk checkout"}
                    </Button>
                    <Link to="/e-commerce" className="mt-3 block text-center text-sm text-button hover:underline">Lanjut belanja</Link>
                </aside>
            </div>
        )
    }

    return (
        <main className="mx-auto w-full max-w-[1720px] px-5 pb-24 pt-16 sm:px-8 lg:px-[6.5vw]">
            <div className="mb-8 flex items-center gap-3 text-button">
                <span className="h-0.75 w-16 bg-button" />
                <h1 className="text-2xl font-semibold sm:text-3xl">Keranjang</h1>
            </div>
            {content}
        </main>
    )
}

export default Cart
