import { useState } from "react"
import { useNavigate } from "react-router-dom"
import PageBanner from "../../components/layout/PageBanner"
import { useAuth } from "../../context/auth"
import { useContent } from "../../context/content"
import { forumCategories } from "../../data/forum"

const NewDiscussion = () => {
    const { user } = useAuth()
    const { addForumPost } = useContent()
    const navigate = useNavigate()
    const [image, setImage] = useState("")
    const [error, setError] = useState("")

    const handleFile = (event) => {
        const file = event.target.files[0]
        setImage(file ? URL.createObjectURL(file) : "")
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        const text = form.get("text").trim()
        const category = form.get("category")
        if (!text || !category) {
            setError("Isi diskusi dan kategori wajib diisi.")
            return
        }
        const post = addForumPost({ text, category, image: image || undefined, author: user.name })
        navigate(`/forum/${post.id}`)
    }

    return (
        <>
            <PageBanner>Mulai Diskusi</PageBanner>

            <div className="px-4 sm:px-8 lg:px-14.75">
                <main className="mx-auto mb-16 mt-12 max-w-430 rounded-lg bg-white px-5 py-7 sm:px-8 lg:mt-21 lg:px-12.25 lg:py-9">
                    <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
                        <label className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                            Apa yang mau kamu diskusikan?
                            <textarea
                                name="text"
                                rows={4}
                                maxLength={280}
                                placeholder="Contoh: Info tempat nongkrong di Unand dong"
                                className="resize-y rounded border border-[#adadad] p-3 text-[16px] text-[#333] outline-none placeholder:text-[#bbb] focus:border-button"
                            />
                        </label>

                        <label className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                            Kategori
                            <select
                                name="category"
                                defaultValue=""
                                className="h-12.25 rounded border border-[#adadad] bg-white px-3 text-sm text-[#333] outline-none focus:border-button"
                            >
                                <option value="" disabled>Pilih kategori</option>
                                {forumCategories.map((category) => <option key={category.label}>{category.label}</option>)}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                            Foto (opsional)
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFile}
                                className="h-8.5 w-full rounded border border-[#adadad] text-sm text-[#404040] file:mr-6 file:h-full file:border-0 file:border-r file:border-[#adadad] file:bg-[#d9d9d9] file:px-3 file:text-sm file:text-[#404040]"
                            />
                        </label>
                        {image && <img src={image} alt="Pratinjau foto" className="max-h-60 w-fit max-w-full rounded object-cover" />}

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

export default NewDiscussion
