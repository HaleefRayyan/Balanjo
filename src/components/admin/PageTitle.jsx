const PageTitle = ({ children, action }) => {
    return (
        <div className="mb-8 flex items-center justify-between gap-4">
            <h1 className="text-[26px] font-medium text-button sm:text-[30px]">{children}</h1>
            {action}
        </div>
    )
}

export default PageTitle
