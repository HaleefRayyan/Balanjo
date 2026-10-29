import { Link } from "react-router-dom"
import DataTable from "../../components/admin/DataTable"
import IconButton from "../../components/admin/IconButton"
import { EditIcon, EyeIcon, TrashIcon } from "../../components/ui/icons"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { useDeleteProduct, useMyProducts } from "../../api/seller"
import { formatRupiah } from "../../utils/format"

const SellerProducts = () => {
    const { data: products, isPending, isError, error, refetch } = useMyProducts()
    const deleteProduct = useDeleteProduct()

    const handleDelete = (product) => {
        if (window.confirm(`Hapus produk "${product.name}"? Riwayat pesanan tetap tersimpan.`)) {
            deleteProduct.mutate(product.id, { onError: (requestError) => window.alert(requestError.message) })
        }
    }

    const columns = [
        { key: "photo", header: "Foto", render: (product) => <img src={product.photo} alt="" className="h-14 w-14 rounded object-cover" /> },
        { key: "name", header: "Nama Produk", className: "max-w-64 font-medium" },
        { key: "category", header: "Kategori", className: "text-abu" },
        { key: "price", header: "Harga", className: "whitespace-nowrap", render: (product) => formatRupiah(product.price) },
        { key: "variants", header: "Variasi", className: "max-w-56 text-sm text-abu", render: (product) => product.variants.join(", ") || "–" },
        {
            key: "actions",
            header: "Aksi",
            className: "whitespace-nowrap",
            render: (product) => (
                <div className="flex items-center gap-3">
                    <Link to={`/e-commerce/product/${product.id}`} aria-label={`Lihat ${product.name}`} title="Lihat di toko" className="rounded-md p-1 text-button hover:bg-button/10">
                        <EyeIcon />
                    </Link>
                    <Link to={`/seller/products/${product.id}/edit`} aria-label={`Edit ${product.name}`} title="Edit" className="rounded-md p-1 text-button hover:bg-button/10">
                        <EditIcon />
                    </Link>
                    <IconButton label={`Hapus ${product.name}`} disabled={deleteProduct.isPending} onClick={() => handleDelete(product)}>
                        <TrashIcon />
                    </IconButton>
                </div>
            ),
        },
    ]

    return (
        <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-abu">{products ? `${products.length} produk` : ""}</p>
                <Link to="/seller/products/new" className="rounded-lg bg-button px-5 py-2.5 text-white hover:bg-[#896d26]">+ Tambah Produk</Link>
            </div>
            {isPending ? <Loading /> : isError ? <ErrorMessage error={error} onRetry={refetch} /> : (
                <DataTable columns={columns} rows={products} emptyText="Belum ada produk. Klik “+ Tambah Produk” untuk mulai berjualan." />
            )}
        </section>
    )
}

export default SellerProducts
