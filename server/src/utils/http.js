// Error yang aman ditampilkan ke klien (status + pesan). Error lain jadi 500 tanpa detail.
export class HttpError extends Error {
    constructor(status, message) {
        super(message)
        this.status = status
    }
}

export const notFound = (what = "Data") => new HttpError(404, `${what} tidak ditemukan.`)

// Validasi dengan skema zod; pesan error pertama dikirim ke klien.
// Skema untuk input pengguna memakai pesan lengkap ("Password minimal 8 karakter."),
// jadi nama field tidak ditambahkan.
export const parse = (schema, data) => {
    const result = schema.safeParse(data)
    if (!result.success) throw new HttpError(400, result.error.issues[0].message)
    return result.data
}

export const parseId = (value) => {
    const id = Number(value)
    if (!Number.isInteger(id) || id < 1) throw new HttpError(400, "ID tidak valid.")
    return id
}
