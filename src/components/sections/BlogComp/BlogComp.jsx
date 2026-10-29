import SectionHeader from "../../ui/SectionHeader"
import { Empty, ErrorMessage, Loading } from "../../ui/Status"
import { useBlogs } from "../../../api/blogs"
import { formatLongDate } from "../../../utils/format"
import defaultCover from "../../../assets/blog/blog.png"
import authorPhoto from "../../../assets/blog/profile.png"
import { Link } from "react-router-dom"

// blogs: daftar dari halaman (sudah difilter; null = masih dimuat).
// Kalau tidak diberikan sama sekali, ambil `limit` artikel terbaru sendiri (Get Started).
const BlogComp = ({ blogs, limit, showHeader = false, emptyText = "Belum ada artikel." })=>{
    const query = useBlogs({ limit }, { enabled: blogs === undefined })
    const list = blogs === undefined ? query.data : blogs

    let content
    if (!list && query.isError) content = <ErrorMessage error={query.error} onRetry={query.refetch} className="mx-auto max-w-430" />
    else if (!list) content = <Loading className="mx-auto max-w-430" />
    else if (list.length === 0) content = <Empty text={emptyText} className="mx-auto max-w-430" />
    else content = (
        <div className="mx-auto grid w-full max-w-430 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
        {list.map((item)=>{
            return <Link to={`/blog/${item.slug}`} key={item.id}><div className="h-full min-h-96 w-full rounded-xl bg-white px-3 py-4 shadow-xl">
            <img src={item.cover ?? defaultCover} alt="" className="mx-auto aspect-[3/2] w-[90%] object-cover"/>
                <div className="mt-4 grid gap-4 px-4 sm:px-6">
                <span className="text-md h-7 w-fit rounded-md bg-amber-100 px-2 py-1 leading-5 text-button">{item.category}</span>
                <p className="text-[20px] font-semibold">{item.title}</p>
                <div className="flex flex-row gap-3.5 items-center text-abu">
                    <img src={item.authorAvatar ?? authorPhoto} alt="" className="h-8.5 w-8.5 rounded-full object-cover" />
                    <span>{item.author}</span>
                    <span>{formatLongDate(new Date(item.createdAt))}</span>
                </div>
            </div>

        </div></Link>
        })}
        </div>
    )

    return <section className="">
        {showHeader && <SectionHeader
            category="Blog"
            label ="Temukan Inspirasi Karya Rangers"
            ket ="Tempat di mana ide-ide segar bertemu dengan pengetahuan mendalam
                    untuk membantu mengembangkan bisnis kamu"
            to='/blog'
        />}
        {content}
    </section>
}

export default BlogComp
