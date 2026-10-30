// Memuat snap.js Midtrans sekali saja (popup pembayaran)
let loading = null

export const loadSnap = ({ clientKey, isProduction }) => {
    if (window.snap) return Promise.resolve(window.snap)
    if (!loading) {
        loading = new Promise((resolve, reject) => {
            const script = document.createElement("script")
            script.src = isProduction ? "https://app.midtrans.com/snap/snap.js" : "https://app.sandbox.midtrans.com/snap/snap.js"
            script.dataset.clientKey = clientKey
            script.onload = () => resolve(window.snap)
            script.onerror = () => {
                loading = null
                script.remove()
                reject(new Error("Gagal memuat halaman pembayaran. Periksa koneksi internet."))
            }
            document.head.appendChild(script)
        })
    }
    return loading
}

// Buka popup Snap. Hasil: "success" | "pending" | "error" | "closed"
export const openSnap = (snap, token) => new Promise((resolve) => {
    snap.pay(token, {
        onSuccess: () => resolve("success"),
        onPending: () => resolve("pending"),
        onError: () => resolve("error"),
        onClose: () => resolve("closed"),
    })
})
