const Search = (props)=>{
    const {className = "", ...rest}=props

    return <input type="search" className={`bg-white shadow h-14 rounded-md px-2 ${className}`} {...rest}/>
}

export default Search
