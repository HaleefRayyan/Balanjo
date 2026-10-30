import { useState } from "react"

const Star = ({ filled, className = "h-4 w-4" }) => (
    <svg className={`${className} ${filled ? "text-amber-400" : "text-[#d9d9d9]"}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8L10 1.6z" />
    </svg>
)

// Tampilan rating (dibulatkan ke bintang terdekat)
export const StarRating = ({ value, className }) => (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value} dari 5 bintang`}>
        {[1, 2, 3, 4, 5].map((n) => <Star key={n} filled={n <= Math.round(value)} className={className} />)}
    </span>
)

// Input rating 1-5 (radio, bisa dipakai dengan keyboard)
export const StarInput = ({ value, onChange, name = "rating" }) => {
    const [hover, setHover] = useState(0)
    return (
        <div className="flex gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
                    <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} className="sr-only" aria-label={`${n} bintang`} />
                    <Star filled={n <= (hover || value)} className="h-8 w-8" />
                </label>
            ))}
        </div>
    )
}
