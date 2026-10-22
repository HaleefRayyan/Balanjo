import forum from "../../../assets/homeIcon/forum.svg"
import eCommerce from "../../../assets/homeIcon/eCommerce.svg"
import blog from "../../../assets/homeIcon/blog.svg"
import Button from "../../ui/Button"
import { useNavigate } from "react-router-dom"

const cart =[
    {
        id:1,
        icon : forum,
        label : "Forum",
        ket : "Fitur untuk berdiskusi, sekaligus memamerkan kreativitas.",
    },
    {
        id:2,
        icon : blog,
        label : "Blog",
        ket : "Fitur untuk saling membantu, melalui tulisan yang dimuat.",
    },
    {
        id:3,
        icon : eCommerce,
        label : "E-Commerce",
        ket : "Membantu menemukan serta memperluas pasar usaha mahasiswa.",
    },
]


const Menu = ()=>{
    const navigate = useNavigate()
    const routes = {
        Forum: "/forum",
        Blog: "/blog",
        "E-Commerce": "/e-commerce",
    }

    return (
        <section className="mx-auto my-20 flex flex-col items-center gap-2 px-5 sm:px-8 lg:my-27.25 lg:px-14.75">
            <h3 className="text-[18px] text-abu font-medium">What we do</h3>
            <h1 className="mb-12 text-center text-4xl font-semibold sm:text-[52px] lg:mb-20">We've Got 3 Features!</h1>
            <div className="grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-15">
                {cart.map((item)=>{
                    return <div className="flex min-h-96 flex-col items-center justify-center gap-9 rounded-2xl bg-white p-8 shadow-xl sm:p-10 lg:h-111 lg:w-88" key={item.id}>
                    <img src={item.icon} alt={item.label} />
                    <p className="text-center text-[18px] font-normal">{item.ket}</p>
                    <Button onClick={() => navigate(routes[item.label])} className="w-40.5 h-12.25">Selengkapnya</Button>
                </div>
                })}
                
            </div>
        </section>
    )
}

export default Menu