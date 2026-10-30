import { useState } from "react"
import { deliveryOptions } from "../../constants/shop"

const inputClass = "h-10 w-full rounded border border-[#d0d0d0] px-3 text-sm text-[#333] outline-none placeholder:text-[#aaa] focus:border-button"

// Data pengiriman di halaman Keranjang. Nilai dikirim lewat onSubmit(delivery).
// method dikontrol dari luar supaya ringkasan harga ikut berubah (ongkos antar).
const CheckoutForm = ({ id, user, method, onMethodChange, onSubmit }) => {
    const [error, setError] = useState("")

    const handleSubmit = (event) => {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        const delivery = {
            method,
            recipientName: form.get("recipientName").trim(),
            phone: form.get("phone").trim(),
            address: (form.get("address") ?? "").trim() || undefined,
            note: form.get("note").trim() || undefined,
        }
        // cek cepat di browser; aturan lengkap dicek server
        if (!/^(\+62|62|0)8\d{7,12}$/.test(delivery.phone.replace(/[\s-]/g, ""))) {
            setError("Nomor HP/WhatsApp tidak valid (contoh: 081234567890).")
            return
        }
        if (method === "DELIVERY" && (delivery.address ?? "").length < 5) {
            setError("Isi titik temu / alamat pengantaran.")
            return
        }
        setError("")
        onSubmit(delivery)
    }

    return (
        <form id={id} onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-line pt-4">
            <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-semibold">Pengiriman</legend>
                {deliveryOptions.map((option) => (
                    <label key={option.value} className={`flex cursor-pointer gap-3 rounded-md border px-3 py-2 text-sm ${method === option.value ? "border-button bg-button/5" : "border-[#e0e0e0]"}`}>
                        <input type="radio" name="method" value={option.value} checked={method === option.value} onChange={() => onMethodChange(option.value)} className="mt-1 accent-button" />
                        <span>
                            <span className="block font-medium">{option.label}</span>
                            <span className="text-xs text-abu">{option.description}</span>
                        </span>
                    </label>
                ))}
            </fieldset>
            <label className="flex flex-col gap-1 text-xs text-[#666]">
                Nama penerima
                <input name="recipientName" required maxLength={80} defaultValue={user.name} autoComplete="name" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[#666]">
                No. HP / WhatsApp
                <input name="phone" type="tel" required placeholder="081234567890" autoComplete="tel" className={inputClass} />
            </label>
            {method === "DELIVERY" && (
                <label className="flex flex-col gap-1 text-xs text-[#666]">
                    Titik temu / alamat di area kampus
                    <textarea name="address" required rows={2} maxLength={300} placeholder="Contoh: Lobi Gedung F, Fakultas Teknik" className={`${inputClass} h-auto py-2`} />
                </label>
            )}
            <label className="flex flex-col gap-1 text-xs text-[#666]">
                Catatan untuk seller (opsional)
                <input name="note" maxLength={300} placeholder="Contoh: warna cadangan, jam ambil" className={inputClass} />
            </label>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        </form>
    )
}

export default CheckoutForm
