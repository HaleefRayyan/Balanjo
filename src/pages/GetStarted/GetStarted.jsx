import ForumComp from "../../components/sections/ForumComp"
import BlogComp from "../../components/sections/BlogComp"
import ECommerceComp from "../../components/sections/ECommerceComp"
import Slider from "../../components/sections/Slider"

const GetStarted = ()=>{
    return (
    <div className="px-5 sm:px-8 lg:px-[97.32px]">
    <Slider />
    <ECommerceComp showHeader />
    <BlogComp showHeader limit={3} />
    <ForumComp showHeader limit={3} />
    </div>
    )
}

export default GetStarted
