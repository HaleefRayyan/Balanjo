import { useState } from "react"
import { useNavigate } from "react-router-dom"
import PageBanner from "../../layout/PageBanner"
import RichTextEditor from "../../ui/RichTextEditor"
import { useCreateBlog, useUpdateBlog } from "../../../api/blogs"
import { blogCategories } from "../../../constants/categories"
import { slugify } from "../../../utils/format"

// DOMParser tidak menjalankan script / memuat gambar (beda dengan innerHTML di elemen biasa)
const hasText = (html) => new DOMParser().parseFromString(html, "text/html").body.textContent.trim().length > 0

// blog kosong = Upload Artikel baru; blog ada = Edit Artikel (slug tidak berubah).
// embedded: tampil di dalam panel Profil (tanpa banner), kembali ke `returnTo` setelah disimpan.
const ArticleForm = ({ blog, embedded = false, returnTo }) => {
    const isEdit = Boolean(blog)
    const createBlog = useCreateBlog()
    const updateBlog = useUpdateBlog()
    const saving = createBlog.isPending || updateBlog.isPending
    const navigate = useNavigate()
    const [title, setTitle] = useState(blog?.title ?? "")
    const [category, setCategory] = useState(blog?.category ?? "")
    const [image, setImage] = useState(null) // { file, preview }
    const [removeImage, setRemoveImage] = useState(false)
    const [body, setBody] = useState(blog?.body ?? "")
    const [error, setError] = useState("")
    const preview = image?.preview ?? (removeImage ? null : blog?.cover)

    const handleFile = (event) => {
        const file = event.target.files[0]
        setImage(file ? { file, preview: URL.createObjectURL(file) } : null)
        if (file) setRemoveImage(false)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        if (!title.trim() || !category || !hasText(body)) {
            setError("Judul, kategori, dan isi artikel wajib diisi.")
            return
        }
        setError("")
        const formData = new FormData()
        formData.set("title", title.trim())
        formData.set("category", category)
        formData.set("body", body)
        if (image) formData.set("image", image.file)
        else if (removeImage) formData.set("removeImage", "1")

        const options = {
            onSuccess: (saved) => navigate(returnTo ?? `/blog/${saved.slug}`),
            onError: (requestError) => setError(requestError.message),
        }
        if (isEdit) updateBlog.mutate({ id: blog.id, formData }, options)
        else createBlog.mutate(formData, options)
    }

    const form = (
                <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
                    <label className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                        Judul
                        <input
                            type="text"
                            name="judul"
                            value={title}
                            maxLength={150}
                            onChange={(event) => setTitle(event.target.value)}
                            className="h-12.25 rounded border border-[#adadad] px-3 text-sm text-[#333] outline-none focus:border-button"
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                        {isEdit ? "Slug (tidak berubah supaya link lama tetap jalan)" : "Slug"}
                        <input
                            type="text"
                            name="slug"
                            value={isEdit ? blog.slug : slugify(title)}
                            disabled
                            className="h-12.25 rounded border border-[#adadad] bg-[#d9d9d9] px-3 text-sm text-[#333]"
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                        Kategori
                        <select
                            name="kategori"
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                            className="h-12.25 appearance-none rounded border border-[#adadad] bg-[linear-gradient(45deg,transparent_50%,#222_50%),linear-gradient(135deg,#222_50%,transparent_50%)] bg-position-[calc(100%-20px)_21px,calc(100%-12px)_21px] bg-size-[9px_9px,9px_9px] bg-no-repeat px-3 text-sm text-[#333] outline-none focus:border-button"
                        >
                            <option value="" disabled />
                            {blogCategories.map((option) => <option key={option}>{option}</option>)}
                        </select>
                    </label>

                    <label className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                        {isEdit ? "Ganti foto (opsional)" : "Foto"}
                        <input
                            type="file"
                            name="foto"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleFile}
                            className="h-8.5 w-full rounded border border-[#adadad] text-sm text-[#404040] file:mr-6 file:h-full file:border-0 file:border-r file:border-[#adadad] file:bg-[#d9d9d9] file:px-3 file:text-sm file:text-[#404040]"
                        />
                    </label>
                    {preview && <img src={preview} alt="Pratinjau foto" className="max-h-60 w-fit max-w-full rounded object-cover" />}
                    {isEdit && blog.cover && !image && (
                        <label className="-mt-4 flex items-center gap-2 text-sm text-[#555]">
                            <input type="checkbox" checked={removeImage} onChange={(event) => setRemoveImage(event.target.checked)} />
                            Hapus foto sampul
                        </label>
                    )}

                    <div className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                        <label htmlFor="body">Body</label>
                        <RichTextEditor id="body" onChange={setBody} initialValue={blog?.body} placeholder="Tulis artikel kamu di sini..." />
                    </div>

                    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

                    <button
                        type="submit"
                        disabled={saving}
                        className="h-10 w-31 cursor-pointer self-end rounded-md bg-button text-[16px] text-white transition-colors hover:bg-[#896d26] disabled:cursor-wait disabled:opacity-60"
                    >
                        {saving ? "Menyimpan..." : isEdit ? "Simpan" : "Kirim"}
                    </button>
                </form>
    )

    if (embedded) return <div className="rounded-lg bg-white px-5 py-7 sm:px-8">{form}</div>

    return (
        <>
            <PageBanner>{isEdit ? "Edit Artikel" : "Upload Artikel"}</PageBanner>

            <div className="px-4 sm:px-8 lg:px-14.75">
            <main className="mx-auto mb-16 mt-12 max-w-430 rounded-lg bg-white px-5 py-7 sm:px-8 lg:mt-21 lg:px-12.25 lg:py-9">
                {form}
            </main>
            </div>
        </>
    )
}

export default ArticleForm
