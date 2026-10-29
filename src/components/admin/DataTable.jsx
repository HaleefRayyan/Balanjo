// Tabel admin: columns = [{ key, header, className, render(row, index) }]
const DataTable = ({ columns, rows, rowKey = "id", emptyText = "Belum ada data." }) => {
    return (
        <div className="overflow-x-auto rounded-lg bg-white px-4 py-4 sm:px-5">
            <table className="w-full min-w-180 border-collapse text-left text-[16px]">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} className={`px-5 pb-6 pt-4 font-normal text-black ${column.headerClassName ?? ""}`}>
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="px-5 py-8 text-center text-abu">{emptyText}</td>
                        </tr>
                    )}
                    {rows.map((row, index) => (
                        <tr key={row[rowKey]} className="border-b border-line last:border-b-0">
                            {columns.map((column) => (
                                <td key={column.key} className={`px-5 py-4 align-middle ${column.className ?? ""}`}>
                                    {column.render ? column.render(row, index) : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default DataTable
