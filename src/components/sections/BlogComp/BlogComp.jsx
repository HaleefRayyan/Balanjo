import SectionHeader from "../../ui/SectionHeader"
import { useContent } from "../../../context/content"
import { Link } from "react-router-dom"

// blogs: daftar yang sudah difilter (default: semua blog)
const BlogComp = ({ blogs, limit, showHeader = false, emptyText = "Belum ada artikel." })=>{
    const { blogs: allBlogs } = useContent()
    const list = blogs ?? allBlogs
    const visibleBlogs = limit ? list.slice(0, limit) : list

    return <section className="">
        {showHeader && <SectionHeader
            category="Blog"
            label ="Temukan Inspirasi Karya Rangers"
            ket ="Tempat di mana ide-ide segar bertemu dengan pengetahuan mendalam
                    untuk membantu mengembangkan bisnis kamu"
            to='/blog'
        />}

        {visibleBlogs.length === 0 && (
            <p className="mx-auto max-w-430 rounded-lg bg-white px-6 py-12 text-center text-abu">{emptyText}</p>
        )}

        <div className="mx-auto grid w-full max-w-430 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">

        {visibleBlogs.map((item)=>{
            return <Link to={`/blog/${item.slug}`} key={item.id}><div className="h-full min-h-96 w-full rounded-xl bg-white px-3 py-4 shadow-xl">
            <img src={item.cover} alt="" className="mx-auto aspect-[3/2] w-[90%] object-cover"/>
                <div className="mt-4 grid gap-4 px-4 sm:px-6">
                <span className="text-md h-7 w-fit rounded-md bg-amber-100 px-2 py-1 leading-5 text-button">{item.category}</span>
                <p className="text-[20px] font-semibold">{item.title}</p>
                <div className="flex flex-row gap-3.5 items-center text-abu">
                    <img src={item.authorPhoto} alt="" />
                    <span>{item.author}</span>
                    <span>{item.date}</span>
                </div>
            </div>

        </div></Link>
        })}

        </div>

    </section>
}

export default BlogComp
