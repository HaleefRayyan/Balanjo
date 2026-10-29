import { useState } from "react"
import { useNavigate } from "react-router-dom"
import PageBanner from "../../components/layout/PageBanner"
import RichTextEditor from "../../components/ui/RichTextEditor"
import { useAuth } from "../../context/auth"
import { useContent } from "../../context/content"
import { blogCategories } from "../../data/blogs"
import { slugify } from "../../utils/format"

const hasText = (html) => {
    const div = document.createElement("div")
    div.innerHTML = html
    return div.textContent.trim().length > 0
}

const UploadArtikel = () => {
    const { user } = useAuth()
    const { addBlog } = useContent()
    const navigate = useNavigate()
    const [title, setTitle] = useState("")
    const [category, setCategory] = useState("")
    const [image, setImage] = useState("")
    const [body, setBody] = useState("")
    const [error, setError] = useState("")

    const handleFile = (event) => {
        const file = event.target.files[0]
        setImage(file ? URL.createObjectURL(file) : "")
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        if (!title.trim() || !category || !hasText(body)) {
            setError("Judul, kategori, dan isi artikel wajib diisi.")
            return
        }
        const blog = addBlog({ title: title.trim(), category, body, image: image || undefined, author: user.name })
        navigate(`/blog/${blog.slug}`)
    }

    return (
        <>
            <PageBanner>Upload Artikel</PageBanner>

            <div className="px-4 sm:px-8 lg:px-14.75">
            <main className="mx-auto mb-16 mt-12 max-w-430 rounded-lg bg-white px-5 py-7 sm:px-8 lg:mt-21 lg:px-12.25 lg:py-9">
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
                        Slug
                        <input
                            type="text"
                            name="slug"
                            value={slugify(title)}
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
                        Foto
                        <input
                            type="file"
                            name="foto"
                            accept="image/*"
                            onChange={handleFile}
                            className="h-8.5 w-full rounded border border-[#adadad] text-sm text-[#404040] file:mr-6 file:h-full file:border-0 file:border-r file:border-[#adadad] file:bg-[#d9d9d9] file:px-3 file:text-sm file:text-[#404040]"
                        />
                    </label>
                    {image && <img src={image} alt="Pratinjau foto" className="max-h-60 w-fit max-w-full rounded object-cover" />}

                    <div className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                        <label htmlFor="body">Body</label>
                        <RichTextEditor id="body" onChange={setBody} placeholder="Tulis artikel kamu di sini..." />
                    </div>

                    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

                    <button
                        type="submit"
                        className="h-10 w-31 cursor-pointer self-end rounded-md bg-button text-[16px] text-white transition-colors hover:bg-[#896d26]"
                    >
                        Kirim
                    </button>
                </form>
            </main>
            </div>
        </>
    )
}

export default UploadArtikel
