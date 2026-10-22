import Search from "../../components/ui/Search"
import ECommerceComp from "../../components/sections/ECommerceComp"
import head from "../../assets/header/header.png"
import { useParams } from "react-router-dom"

const DetailCategory = () => {
    const { category } = useParams()

    return <>
        <main className="mx-auto w-full max-w-[1720px] px-5 pb-20 pt-29 lg:pt-16 sm:px-8 lg:px-[6.5vw]">
            <Search
                className="h-10 w-full rounded-md px-4 text-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.08)] placeholder:text-[#aaa]"
                placeholder="Search for products..."
            />

            <section
                className="mt-5 flex h-40 items-center justify-center rounded-lg bg-cover bg-center bg-no-repeat sm:h-44"
                style={{ backgroundImage: `url(${head})` }}
                aria-label={`${category} category`}
            >
                <h1 className="text-center text-4xl font-bold leading-none text-white sm:text-5xl">
                    {category}
                </h1>
            </section>

            <div className="mt-12">
                <ECommerceComp />
            </div>

            <div className="mt-8 flex items-center justify-end gap-5 text-[11px]">
                <span>Showing <strong>1 to 12</strong> results of 24 results</span>
                <button type="button" aria-label="Previous page">‹</button>
                <button className="h-8 w-8 rounded-md bg-button text-white" type="button">1</button>
                <button type="button">2</button>
                <button type="button" aria-label="Next page">›</button>
            </div>
        </main>
    </>
}

export default DetailCategory