// Tombol ikon emas untuk kolom "Aksi"
const IconButton = ({ label, children, className = "", ...rest }) => {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className={`inline-flex cursor-pointer items-center justify-center rounded-md p-1 text-button transition-colors hover:bg-button/10 ${className}`}
            {...rest}
        >
            {children}
        </button>
    )
}

export default IconButton
