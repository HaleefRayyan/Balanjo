import { useState } from "react"
import { useSearchParams } from "react-router-dom"

// Teks pencarian produk disimpan di state halaman (bukan URL tiap ketikan: itu membuat huruf
// hilang saat mengetik cepat). ?q= hanya dipakai sebagai nilai awal, mis. dari halaman detail.
const useProductQuery = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [query, setQuery] = useState(searchParams.get("q") ?? "")

    const updateQuery = (value) => {
        setQuery(value)
        // buang ?q= lama dan kembali ke halaman 1
        if (searchParams.has("q") || searchParams.has("page")) setSearchParams({}, { replace: true })
    }

    return [query, updateQuery]
}

export default useProductQuery
