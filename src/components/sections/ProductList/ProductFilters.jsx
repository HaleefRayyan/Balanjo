import { useState } from "react"

const sortOptions = [
    { value: "", label: "Paling relevan" },
    { value: "newest", label: "Terbaru" },
    { value: "price_asc", label: "Harga terendah" },
    { value: "price_desc", label: "Harga tertinggi" },
    { value: "rating", label: "Rating tertinggi" },
]

const inputClass = "h-9 w-28 rounded border border-[#d7d7d7] bg-white px-2 text-sm text-[#333] outline-none focus:border-button"

// Urutkan + rentang harga. Nilai harga baru diterapkan saat tombol Terapkan / Enter.
const ProductFilters = ({ sort, minPrice, maxPrice, onChange }) => {
    const [min, setMin] = useState(minPrice ?? "")
    const [max, setMax] = useState(maxPrice ?? "")
    const active = sort || minPrice || maxPrice

    const applyPrice = (event) => {
        event.preventDefault()
        // min > max: ditukar supaya tetap masuk akal
        const [low, high] = min && max && Number(min) > Number(max) ? [max, min] : [min, max]
        setMin(low)
        setMax(high)
        onChange({ minPrice: low, maxPrice: high })
    }

    const reset = () => {
        setMin("")
        setMax("")
        onChange({ sort: "", minPrice: "", maxPrice: "" })
    }

    return (
        <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg bg-white px-4 py-3 text-sm">
            <label className="flex items-center gap-2 text-[#666]">
                Urutkan
                <select
                    aria-label="Urutkan produk"
                    value={sort ?? ""}
                    onChange={(event) => onChange({ sort: event.target.value })}
                    className="h-9 rounded border border-[#d7d7d7] bg-white px-2 text-[#333] outline-none focus:border-button"
                >
                    {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
            </label>
            <form onSubmit={applyPrice} className="flex flex-wrap items-center gap-2 text-[#666]">
                Harga
                <input type="number" min={0} step={1000} value={min} onChange={(event) => setMin(event.target.value)} placeholder="Min" aria-label="Harga minimum" className={inputClass} />
                <span>–</span>
                <input type="number" min={0} step={1000} value={max} onChange={(event) => setMax(event.target.value)} placeholder="Maks" aria-label="Harga maksimum" className={inputClass} />
                <button type="submit" className="h-9 cursor-pointer rounded border border-button px-3 text-button hover:bg-button hover:text-white">Terapkan</button>
            </form>
            {active && <button type="button" onClick={reset} className="cursor-pointer text-abu hover:text-button">Reset filter</button>}
        </div>
    )
}

export default ProductFilters
