import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Button from "../../ui/Button"
import { useCart } from "../../../context/cart"
import { useAuth } from "../../../context/auth"
import { formatRupiah } from "../../../utils/format"

const ProductCard = ({ product }) => {
    const { addItem } = useCart()
    const { user } = useAuth()
    const isOwnProduct = user && product.sellerId === user.id
    const [added, setAdded] = useState(false)
    const link = `/e-commerce/product/${product.id}`

    useEffect(() => {
        if (!added) return
        const timer = setTimeout(() => setAdded(false), 1500)
        return () => clearTimeout(timer)
    }, [added])

    // "+ Keranjang" langsung menambah 1 dengan variasi pertama; pilih variasi lain di halaman detail
    const handleAdd = () => {
        addItem(product.id, product.variants?.[0], 1)
        setAdded(true)
    }

    return (
        <article className="overflow-hidden rounded-lg bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <Link to={link}>
                <img src={product.photo} alt={product.name} className="aspect-281/223 w-full object-cover" />
            </Link>
            <div className="flex min-h-36 flex-col items-center px-2 py-3 text-center sm:min-h-45 sm:px-4 sm:py-4">
                <h2 className="text-xs font-normal text-abu sm:text-[16px]">{product.category}</h2>
                <h3 className="min-h-8 text-sm font-normal leading-tight sm:min-h-10.5 sm:text-[18px]">
                    <Link to={link} className="hover:text-button">{product.name}</Link>
                </h3>
                <span className="mt-2 text-base font-semibold sm:mt-4 sm:text-[20px]">{formatRupiah(product.price)}</span>
                {isOwnProduct ? (
                    <Link to="/seller/products" className="mt-2 flex h-9 w-full max-w-37.5 items-center justify-center rounded-md border border-button text-[11px] text-button sm:mt-4 sm:h-11 sm:text-[14px]">
                        Produk tokomu
                    </Link>
                ) : product.stock === 0 ? (
                    <Button disabled className="mt-2 h-9 w-full max-w-37.5 cursor-not-allowed rounded-md text-[11px] opacity-50 sm:mt-4 sm:h-11 sm:text-[14px]">
                        Stok habis
                    </Button>
                ) : (
                    <Button onClick={handleAdd} aria-live="polite" className="mt-2 h-9 w-full max-w-37.5 rounded-md text-[11px] sm:mt-4 sm:h-11 sm:text-[14px]">
                        {added ? "✓ Ditambahkan" : "+ Keranjang"}
                    </Button>
                )}
            </div>
        </article>
    )
}

export default ProductCard
