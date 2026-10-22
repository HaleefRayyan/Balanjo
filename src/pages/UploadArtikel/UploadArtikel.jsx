import PageBanner from "../../components/layout/PageBanner"
import { blogCategories } from "../../data/blogs"

const UploadArtikel = () => {

    return (
        <>
            <PageBanner>Upload Artikel</PageBanner>

            <div className="px-4 sm:px-8 lg:px-14.75">
            <main className="mx-auto mb-16 mt-12 max-w-430 rounded-lg bg-white px-5 py-7 sm:px-8 lg:mt-21 lg:px-12.25 lg:py-9">
                <form className="flex flex-col gap-8">
                    <label className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                        Judul
                        <input
                            type="text"
                            name="judul"
                            className="h-12.25 rounded border border-[#adadad] px-3 text-sm text-[#333] outline-none focus:border-button"
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                        Slug
                        <input
                            type="text"
                            name="slug"
                            disabled
                            className="h-12.25 rounded border border-[#adadad] bg-[#d9d9d9] px-3 text-sm text-[#333]"
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                        Kategori
                        <select
                            name="kategori"
                            defaultValue=""
                            className="h-12.25 appearance-none rounded border border-[#adadad] bg-[linear-gradient(45deg,transparent_50%,#222_50%),linear-gradient(135deg,#222_50%,transparent_50%)] bg-position-[calc(100%-20px)_21px,calc(100%-12px)_21px] bg-size-[9px_9px,9px_9px] bg-no-repeat px-3 text-sm text-[#333] outline-none focus:border-button"
                        >
                            <option value="" disabled />
                            {blogCategories.map((category) => (
                                <option key={category.value} value={category.value}>{category.label}</option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                        Foto
                        <input
                            type="file"
                            name="foto"
                            accept="image/*"
                            className="h-8.5 w-full rounded border border-[#adadad] text-sm text-[#404040] file:mr-6 file:h-full file:border-0 file:border-r file:border-[#adadad] file:bg-[#d9d9d9] file:px-3 file:text-sm file:text-[#404040]"
                        />
                    </label>

                    <div className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                        <label htmlFor="body">Body</label>
                        <div className="flex h-6 items-center gap-3 text-xs text-[#333]" aria-label="Toolbar editor">
                            <span>Normal text⌄</span>
                            <span>☷⌄</span>
                            <strong>B</strong>
                            <em>I</em>
                            <u>U</u>
                            <span className="line-through">S</span>
                            <span>‹›</span>
                            <span>♧</span>
                            <span>•☷</span>
                            <span>1☷</span>
                            <span>↗</span>
                            <span>‹/›</span>
                            <span>❝</span>
                            <span>―</span>
                        </div>
                        <textarea
                            id="body"
                            name="body"
                            className="h-50 resize-none rounded border border-[#adadad] p-3 text-sm text-[#333] outline-none focus:border-button"
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-3 h-7.5 w-23.25 self-end rounded-md bg-button text-sm text-white transition-colors hover:bg-[#896d26]"
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