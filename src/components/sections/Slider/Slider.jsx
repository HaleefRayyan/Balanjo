import { useEffect, useState } from 'react'
import banner from '../../../assets/started/banner.png'
import bannerDua from '../../../assets/started/bannerDua.png'
import bannerTiga from '../../../assets/started/bannerTiga.png'
import kanan from '../../../assets/started/kanan.svg'
import kiri from '../../../assets/started/kiri.svg'

const slides = [
    { id: 1, image: banner },
    { id: 2, image: bannerDua},
    { id: 3, image: bannerTiga },
]
const Slider = ()=>{
     const [currentIndex, setCurrentIndex] = useState(0);
      const nextSlide = () => {
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }

        const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
    }
        const goToSlide = (index) => {
        setCurrentIndex(index)
    }

      useEffect(() => {
        const interval = setInterval(() => {
            nextSlide()
        }, 5000)

        return () => clearInterval(interval) // cleanup biar tidak dobel interval
    }, [currentIndex])

    

        return(
            <>
        <div className="relative mx-auto mt-8 h-56 w-full max-w-430 overflow-hidden rounded-2xl sm:mt-20 sm:h-80 lg:mt-22.75 lg:h-150">
            <img 
                src={slides[currentIndex].image} 
                alt={`slide-${currentIndex}`}
                className="w-full h-full object-cover transition-all duration-500"
            />

            <button 
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer sm:left-6 lg:left-15"
            >
                <img src={kiri} alt="" />
            </button>

            {/* tombol panah kanan */}
            <button 
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer sm:right-6 lg:right-15"
            >
                <img src={kanan} alt="" />
            </button>

            {/* dots indikator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full ${
                            index === currentIndex ? "bg-white" : "bg-white/50"
                        }`}
                    />
                ))}
            </div>
        </div>
        <div className="mx-auto mt-8 grid max-w-430 grid-cols-1 gap-6 pb-4 sm:grid-cols-2 lg:mt-10 lg:mb-10 lg:gap-10">
            <img src={bannerDua} alt="" className="w-full" />
            <img src={bannerTiga} alt="" className="w-full"/>
        </div>
        </>
    )

}

export default Slider