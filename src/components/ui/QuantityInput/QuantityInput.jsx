const QuantityInput = ({ value, onChange, min = 1, max = 99, className = "" }) => {
    return (
        <div className={`flex items-center justify-between rounded-md bg-text px-4 text-sm text-abu ${className}`}>
            <button type="button" aria-label="Kurangi jumlah" disabled={value <= min} className="cursor-pointer px-1 disabled:cursor-not-allowed disabled:opacity-40" onClick={() => onChange(value - 1)}>−</button>
            <span className="font-medium text-[#555]" aria-live="polite">{value}</span>
            <button type="button" aria-label="Tambah jumlah" disabled={value >= max} className="cursor-pointer px-1 disabled:cursor-not-allowed disabled:opacity-40" onClick={() => onChange(value + 1)}>+</button>
        </div>
    )
}

export default QuantityInput
