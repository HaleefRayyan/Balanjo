import { Link } from "react-router-dom";

const SectionHeader = (props)=>{
    const {category,label, ket, to }= props;
    return (
        <div className="my-16 flex h-auto flex-col gap-3 sm:my-20 lg:my-22.5 lg:h-36.5">
        <h2 className="mb-2 text-[16px] font-medium sm:mb-3">{category}</h2>
        <h1 className="text-3xl font-bold leading-tight text-button sm:text-[35px]">{label}</h1>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <p className="w-full max-w-143.5 text-abu">{ket}
            </p>
            <Link to={to} className="flex h-11.25 w-34.25 shrink-0 items-center justify-around rounded-xl bg-black px-3 py-2 text-white hover:text-abu">Lainnya <div className="text-[20px]">{'->'}</div></Link>
        </div>
    </div>
    )
}

export default SectionHeader
