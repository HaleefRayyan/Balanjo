const Button = (props)=>{
    const {children, className = "", type = "button", ...rest} = props;
    return (
        <button type={type} className={`bg-button rounded-2xl text-white cursor-pointer ${className}`} {...rest}>
            {children}
        </button>
    )
}

export default Button
