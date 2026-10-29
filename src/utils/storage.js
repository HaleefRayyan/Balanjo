// localStorage bisa diblokir (mode private / data situs dihapus), jadi semua akses dibungkus try/catch

export const readJSON = (key, fallback) => {
    try {
        const value = localStorage.getItem(key)
        return value === null ? fallback : JSON.parse(value)
    } catch {
        return fallback
    }
}

export const writeJSON = (key, value) => {
    try {
        if (value === null || value === undefined) localStorage.removeItem(key)
        else localStorage.setItem(key, JSON.stringify(value))
    } catch {
        // abaikan: data tetap ada selama tab terbuka
    }
}
