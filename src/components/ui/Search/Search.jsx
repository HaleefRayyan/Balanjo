// icon: tampilkan ikon kaca pembesar di kiri; wrapperClassName mengatur lebar saat pakai ikon
const Search = (props)=>{
    const {className = "", icon = false, wrapperClassName = "", ...rest}=props

    if (!icon) {
        return <input type="search" className={`bg-white shadow h-14 rounded-md px-2 ${className}`} {...rest}/>
    }

    return (
        <div className={`relative ${wrapperClassName}`}>
            <svg className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-abu" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <circle cx="8.5" cy="8.5" r="6" />
                <path d="M13 13l4.5 4.5" />
            </svg>
            <input type="search" className={`bg-white shadow h-14 w-full rounded-md pl-13 pr-2 ${className}`} {...rest}/>
        </div>
    )
}

export default Search
