import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import PageBanner from "../../components/layout/PageBanner"
import BlogComp from "../../components/sections/BlogComp"
import Button from "../../components/ui/Button"
import Search from "../../components/ui/Search"
import { ErrorMessage } from "../../components/ui/Status"
import { useBlogs } from "../../api/blogs"
import { blogCategories } from "../../constants/categories"
import useDebouncedValue from "../../hooks/useDebouncedValue"

const Blog =()=>{
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams()
    const category = searchParams.get("category") ?? ""
    // teks pencarian disimpan di state (bukan URL tiap ketikan, supaya tidak ada huruf hilang)
    const [searchText, setSearchText] = useState("")

    const q = useDebouncedValue(searchText.trim())
    const blogs = useBlogs({ q, category })

    // kategori disimpan di URL (?category=) supaya bisa dibagikan / tetap saat kembali
    const updateCategory = (value) => setSearchParams(value ? { category: value } : {}, { replace: true })

    return (
        <>
    <PageBanner>Blog</PageBanner>
    <div className="px-5 pb-24 pt-[64.17px] sm:px-8 lg:px-14.75 lg:pb-32">
        <div className="mx-auto max-w-430">
            <div className="flex w-full flex-col items-stretch gap-4 py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:py-15">
                <Search
                    icon
                    wrapperClassName="w-full lg:flex-1"
                    placeholder="Search for products..."
                    aria-label="Cari artikel"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                />
                <select
                    aria-label="Filter kategori"
                    value={category}
                    onChange={(event) => updateCategory(event.target.value)}
                    className="h-14 w-full cursor-pointer rounded bg-white px-2 shadow lg:w-73 lg:shrink-0"
                >
                    <option value="">Filter Kategori</option>
                    {blogCategories.map((option) => <option key={option}>{option}</option>)}
                </select>
                <Button className="h-14 w-full lg:w-73 lg:shrink-0" onClick={() => navigate("/blog/new")}>Buat artikel kamu</Button>
            </div>
            {blogs.isError
                ? <ErrorMessage error={blogs.error} onRetry={blogs.refetch} />
                : <BlogComp blogs={blogs.data ?? null} emptyText="Artikel tidak ditemukan." />}
        </div>
    </div>
        </>
    )
}

export default Blog
