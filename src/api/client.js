// Pembungkus fetch untuk backend (server/). Cookie login dikirim otomatis (same-origin via proxy Vite).

export class ApiError extends Error {
    constructor(message, status) {
        super(message)
        this.status = status
    }
}

// body: object -> JSON; FormData -> multipart (untuk upload gambar)
// keepalive: request tetap terkirim walau halaman sedang ditutup / di-reload
export const api = async (path, { method = "GET", body, keepalive } = {}) => {
    const isForm = body instanceof FormData
    let response
    try {
        response = await fetch(`/api${path}`, {
            method,
            credentials: "same-origin",
            headers: body && !isForm ? { "Content-Type": "application/json" } : undefined,
            body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
            keepalive,
        })
    } catch {
        throw new ApiError("Tidak bisa terhubung ke server. Pastikan backend berjalan.", 0)
    }

    if (response.status === 204) return null
    const data = await response.json().catch(() => null)
    if (!response.ok) throw new ApiError(data?.error ?? `Permintaan gagal (${response.status}).`, response.status)
    return data
}

// ?a=1&b=2 tanpa nilai kosong
export const toQuery = (params = {}) => {
    const search = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") search.set(key, value)
    }
    const string = search.toString()
    return string ? `?${string}` : ""
}
