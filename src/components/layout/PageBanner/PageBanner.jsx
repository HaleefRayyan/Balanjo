import head from "../../../assets/header/header.png"

// Banner emas di atas halaman (Blog, Forum, Upload Artikel)
const PageBanner =(props)=>{
    const {children}= props;
    return (
        <div className="mt-8 px-4 sm:mt-20 sm:px-8 lg:mt-23 lg:px-14.75">
            <div
                className="mx-auto flex h-40 max-w-430 items-center justify-center rounded-lg bg-cover bg-center bg-no-repeat sm:h-52 lg:h-60"
                style={{ backgroundImage: `url(${head})` }}
            >
                <h1 className="text-center text-4xl font-bold leading-none text-white sm:text-5xl lg:text-[55px]">
                    { children}
                </h1>
            </div>
        </div>
    )
}
 export default PageBanner
