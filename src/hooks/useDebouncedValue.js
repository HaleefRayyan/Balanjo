import { useEffect, useState } from "react"

// Nilai yang baru berubah setelah `delay` ms tanpa perubahan (mis. pencarian saat mengetik)
const useDebouncedValue = (value, delay = 300) => {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debounced
}

export default useDebouncedValue
