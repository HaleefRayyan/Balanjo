import { useNavigate } from "react-router-dom"
import PageBanner from "../../components/layout/PageBanner"
import BlogComp from "../../components/sections/BlogComp"
import Button from "../../components/ui/Button"
import Search from "../../components/ui/Search"

const Blog =()=>{
        const navigate = useNavigate();
    return (
        <>
    <PageBanner>Blog</PageBanner>
    <div className="px-5 pb-24 pt-[64.17px] sm:px-8 lg:px-14.75 lg:pb-32">
        <div className="mx-auto max-w-430">
            <div className="flex w-full flex-col items-stretch gap-4 py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:py-15">
                <Search icon wrapperClassName="w-full lg:flex-1" placeholder="Search for products..." aria-label="Cari artikel" />
                <select className="h-14 w-full rounded bg-white px-2 shadow lg:w-73 lg:shrink-0">
                    <option value="">Filter Kategori</option>
                </select>
                <Button className="h-14 w-full lg:w-73 lg:shrink-0" onClick={() => navigate("/blog/new")}>Buat artikel kamu</Button>
            </div>
            <BlogComp />
        </div>
    </div>
        </>
    )
}

export default Blog
