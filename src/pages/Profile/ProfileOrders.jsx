import { Link } from "react-router-dom"
import DataTable from "../../components/admin/DataTable"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { useCancelOrder, useMyOrders } from "../../api/orders"
import { orderStatus } from "../../constants/orders"
import { formatCode, formatLongDate, formatRupiah } from "../../utils/format"
import ProfileCard from "./ProfileCard"

// Desain: Order ID, Produk, Tanggal, Status, Price — satu baris per produk yang dipesan.
// Tambahan: tombol Batalkan (seluruh pesanan) selama belum ada seller yang memproses.
const ProfileOrders = () => {
    const { data: orders, isPending, isError, error, refetch } = useMyOrders()
    const cancelOrder = useCancelOrder()

    const handleCancel = (order) => {
        if (window.confirm(`Batalkan pesanan ${formatCode(order.id)}?`)) {
            cancelOrder.mutate(order.id, { onError: (requestError) => window.alert(requestError.message) })
        }
    }

    const rows = (orders ?? []).flatMap((order) => order.items.map((item, index) => ({
        ...item,
        rowId: item.id,
        order,
        firstOfOrder: index === 0,
    })))

    const columns = [
        { key: "orderId", header: "Order ID", className: "text-abu", render: (row) => formatCode(row.order.id) },
        {
            key: "name",
            header: "Produk",
            className: "max-w-56",
            render: (row) => row.photo && row.productId
                ? <Link to={`/e-commerce/product/${row.productId}`} className="hover:text-button">{row.name}</Link>
                : <span>{row.name}{!row.photo && <span className="ml-1 text-xs text-abu">(dihapus)</span>}</span>,
        },
        { key: "createdAt", header: "Tanggal", className: "text-abu", render: (row) => formatLongDate(new Date(row.order.createdAt)) },
        {
            key: "status",
            header: "Status",
            render: (row) => (
                <span className="flex flex-col items-start gap-1">
                    <span className={row.status === "CANCELLED" ? "text-abu" : "text-[#333]"}>{orderStatus[row.status]?.label}</span>
                    {row.firstOfOrder && row.order.items.every((item) => item.status === "PENDING") && (
                        <button type="button" disabled={cancelOrder.isPending} onClick={() => handleCancel(row.order)} className="cursor-pointer text-xs text-red-600 hover:underline disabled:opacity-50">
                            Batalkan pesanan
                        </button>
                    )}
                </span>
            ),
        },
        { key: "price", header: "Price", className: "whitespace-nowrap", render: (row) => formatRupiah(row.price * row.quantity) },
    ]

    return (
        <ProfileCard title="Riwayat Pesanan">
            {isPending ? <Loading /> : isError ? <ErrorMessage error={error} onRetry={refetch} /> : (
                <DataTable columns={columns} rows={rows} rowKey="rowId" emptyText="Kamu belum punya pesanan." />
            )}
        </ProfileCard>
    )
}

export default ProfileOrders
