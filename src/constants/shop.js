// Harus sama dengan server/src/constants.js
export const DELIVERY_FEE_PER_SELLER = 5000

export const deliveryOptions = [
    { value: "PICKUP", label: "Ambil di kampus", description: "Ambil langsung dari seller. Gratis." },
    { value: "DELIVERY", label: "Antar di area kampus", description: "Seller mengantar ke titik temu. Ongkos per seller." },
]

export const deliveryLabel = (method) => deliveryOptions.find((option) => option.value === method)?.label ?? method
