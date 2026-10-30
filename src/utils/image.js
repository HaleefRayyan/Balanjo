// Kecilkan foto sebelum upload (sisi terpanjang maks. 1600 px, JPEG). Server di Vercel hanya menerima
// body ~4,5 MB, sedangkan foto HP bisa 5-10 MB per foto. File kecil dan GIF (animasi) dikirim apa adanya.
const MAX_SIDE = 1600
const SMALL_ENOUGH = 400 * 1024

export const compressImage = async (file) => {
    if (file.type === "image/gif" || file.size <= SMALL_ENOUGH) return file
    const bitmap = await createImageBitmap(file).catch(() => null)
    if (!bitmap) return file
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const context = canvas.getContext("2d")
    context.fillStyle = "#fff" // PNG transparan -> latar putih
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85))
    if (!blob || blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" })
}
