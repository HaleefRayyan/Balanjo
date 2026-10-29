import { useEffect, useState } from 'react'
import bannerDua from '../../../assets/started/bannerDua.png'
import bannerTiga from '../../../assets/started/bannerTiga.png'
import kanan from '../../../assets/started/kanan.svg'
import kiri from '../../../assets/started/kiri.svg'
import { useContent } from '../../../context/content'

const INTERVAL = 5000

// Slide diambil dari banner yang dikelola admin (Kelola E-Commerce)
const Slider = ()=>{
    const { banners: slides } = useContent()
    const [index, setIndex] = useState(0)
    // jaga-jaga kalau admin menghapus banner sehingga index lama melewati jumlah slide
    const currentIndex = slides.length ? index % slides.length : 0

    const nextSlide = () => setIndex((currentIndex + 1) % slides.length)
    const prevSlide = () => setIndex((currentIndex - 1 + slides.length) % slides.length)

    useEffect(() => {
        if (slides.length < 2) return
        const interval = setInterval(() => setIndex((prev) => (prev + 1) % slides.length), INTERVAL)
        return () => clearInterval(interval) // cleanup biar tidak dobel interval
    }, [slides.length, currentIndex])

        return(
            <>
        {slides.length > 0 && (
        <div className="relative mx-auto mt-8 h-56 w-full max-w-430 overflow-hidden rounded-2xl sm:mt-20 sm:h-80 lg:mt-22.75 lg:h-150">
            <img
                src={slides[currentIndex].image}
                alt={slides[currentIndex].id}
                className="w-full h-full object-cover transition-all duration-500"
            />

            {slides.length > 1 && <>
            <button
                type="button"
                aria-label="Slide sebelumnya"
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer sm:left-6 lg:left-15"
            >
                <img src={kiri} alt="" />
            </button>

            {/* tombol panah kanan */}
            <button
                type="button"
                aria-label="Slide berikutnya"
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer sm:right-6 lg:right-15"
            >
                <img src={kanan} alt="" />
            </button>

            {/* dots indikator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((slide, slideIndex) => (
                    <button
                        type="button"
                        key={slide.id}
                        aria-label={`Ke ${slide.id}`}
                        aria-current={slideIndex === currentIndex ? "true" : undefined}
                        onClick={() => setIndex(slideIndex)}
                        className={`w-3 h-3 cursor-pointer rounded-full ${
                            slideIndex === currentIndex ? "bg-white" : "bg-white/50"
                        }`}
                    />
                ))}
            </div>
            </>}
        </div>
        )}
        <div className="mx-auto mt-8 grid max-w-430 grid-cols-1 gap-6 pb-4 sm:grid-cols-2 lg:mt-10 lg:mb-10 lg:gap-10">
            <img src={bannerDua} alt="" className="w-full" />
            <img src={bannerTiga} alt="" className="w-full"/>
        </div>
        </>
    )

}

export default Slider
