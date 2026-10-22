import SectionHeader from "../../ui/SectionHeader"
import blogs from "../../../data/blogs"
import { Link } from "react-router-dom"

const BlogComp = ({ limit, showHeader = false })=>{
    const visibleBlogs = limit ? blogs.slice(0, limit) : blogs

    return <section className="">
        {showHeader && <SectionHeader
            category="Blog"
            label ="Temukan Inspirasi Karya Rangers"
            ket ="Tempat di mana ide-ide segar bertemu dengan pengetahuan mendalam
                    untuk membantu mengembangkan bisnis kamu"
            to='/blog'
        />}

        <div className="mx-auto grid w-full max-w-430 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">

        {visibleBlogs.map((item)=>{
            return <Link to={`/blog/${item.slug}`} key={item.id}><div className="h-full min-h-96 w-full rounded-xl bg-white px-3 py-4 shadow-xl">
            <img src={item.cover} alt="" className="mx-auto w-[90%]"/>
                <div className="mt-4 grid gap-4 px-4 sm:px-6">
                <span className="text-md py-1 pl-2 text-button bg-amber-100 w-24.5 h-7 rounded-md">{item.category}</span>
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
