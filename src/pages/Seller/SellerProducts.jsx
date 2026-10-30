import { Link } from "react-router-dom"
import DataTable from "../../components/admin/DataTable"
import IconButton from "../../components/admin/IconButton"
import { EditIcon, EyeIcon, TrashIcon } from "../../components/ui/icons"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { useDeleteProduct, useMyProducts } from "../../api/seller"
import { formatCode, formatRupiah } from "../../utils/format"

// Desain: Produk ID, Nama Produk, Stok, Harga, Terjual, Deskripsi, Aksi
const SellerProducts = () => {
    const { data: products, isPending, isError, error, refetch } = useMyProducts()
    const deleteProduct = useDeleteProduct()

    const handleDelete = (product) => {
        if (window.confirm(`Hapus produk "${product.name}"? Riwayat pesanan tetap tersimpan.`)) {
            deleteProduct.mutate(product.id, { onError: (requestError) => window.alert(requestError.message) })
        }
    }

    const columns = [
        { key: "id", header: "Produk ID", className: "text-abu", render: (product) => formatCode(product.id) },
        {
            key: "name",
            header: "Nama Produk",
            className: "max-w-56 font-medium",
            render: (product) => (
                <span className="flex items-center gap-3">
                    <img src={product.photo} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
                    <span className="truncate">{product.name}</span>
                </span>
            ),
        },
        {
            key: "stock",
            header: "Stok",
            className: "text-abu",
            render: (product) => (
                <>
                    {product.stock === 0 ? <span className="font-medium text-red-600">Habis</span> : product.stock}
                    {product.variants.length > 0 && (
                        <span className="block text-xs text-abu">
                            {product.variants.map((name) => `${name} ${product.variantStock[name]}`).join(" · ")}
                        </span>
                    )}
                </>
            ),
        },
        { key: "price", header: "Harga", className: "whitespace-nowrap text-abu", render: (product) => formatRupiah(product.price) },
        { key: "sold", header: "Terjual", className: "text-abu" },
        { key: "description", header: "Deskripsi", className: "max-w-64 text-sm text-abu", render: (product) => <span className="line-clamp-1">{product.description}</span> },
        {
            key: "actions",
            header: "Aksi",
            className: "whitespace-nowrap",
            render: (product) => (
                <div className="flex items-center gap-2">
                    <Link to={`/e-commerce/product/${product.id}`} aria-label={`Lihat ${product.name}`} title="Lihat di toko" className="rounded-md p-1 text-button hover:bg-button/10">
                        <EyeIcon className="h-5 w-5" />
                    </Link>
                    <Link to={`/seller/products/${product.id}/edit`} aria-label={`Edit ${product.name}`} title="Edit" className="rounded-md p-1 text-button hover:bg-button/10">
                        <EditIcon className="h-5 w-5" />
                    </Link>
                    <IconButton label={`Hapus ${product.name}`} disabled={deleteProduct.isPending} onClick={() => handleDelete(product)}>
                        <TrashIcon className="h-5 w-5" />
                    </IconButton>
                </div>
            ),
        },
    ]

    return (
        <section>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-[22px] font-medium text-button">Produk</h1>
                <Link to="/seller/products/new" className="rounded-md bg-button px-5 py-2 text-sm text-white hover:bg-[#896d26]">+ Tambah</Link>
            </div>
            {isPending ? <Loading /> : isError ? <ErrorMessage error={error} onRetry={refetch} /> : (
                <DataTable columns={columns} rows={products} emptyText="Belum ada produk. Klik “+ Tambah” untuk mulai berjualan." />
            )}
        </section>
    )
}

export default SellerProducts
