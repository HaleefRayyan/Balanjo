// Pesanan masuk (dikelompokkan per pesanan dari API) -> satu baris per produk yang dipesan
// (desain: Order ID, Produk, Qty, Tanggal, Nama Kustomer, Total, Status, Aksi)
const flattenOrders = (orders) =>
    orders.flatMap((order) => order.items.map((item) => ({
        ...item,
        rowId: item.id,
        orderId: order.orderId,
        createdAt: order.createdAt,
        buyer: order.buyer,
        delivery: order.delivery,
    })))

export default flattenOrders
