import { ErrorMessage, Loading } from "../../components/ui/Status"
import { useSellerOrders } from "../../api/seller"
import SellerOrderTable from "./SellerOrderTable"
import flattenOrders from "./flattenOrders"

// Semua pesanan yang berisi produk seller ini (item dari seller lain tidak ditampilkan)
const SellerOrders = () => {
    const { data, isPending, isError, error, refetch } = useSellerOrders()

    return (
        <section>
            <h1 className="mb-6 text-[22px] font-medium text-button">Pesanan</h1>
            {isPending ? <Loading /> : isError ? <ErrorMessage error={error} onRetry={refetch} /> : (
                <SellerOrderTable rows={flattenOrders(data)} />
            )}
        </section>
    )
}

export default SellerOrders
