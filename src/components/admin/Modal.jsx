import { useEffect } from "react"

const Modal = ({ title, onClose, children }) => {
    useEffect(() => {
        const handleKey = (event) => {
            if (event.key === "Escape") onClose()
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [onClose])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-[22px] font-medium text-button">{title}</h2>
                    <button type="button" aria-label="Tutup" className="cursor-pointer text-2xl leading-none text-abu hover:text-black" onClick={onClose}>×</button>
                </div>
                {children}
            </div>
        </div>
    )
}

export default Modal
