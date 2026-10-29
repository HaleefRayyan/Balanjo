// statuses: peta { STATUS: { label, className } } dari src/constants/orders.js
const StatusBadge = ({ status, statuses }) => {
    const info = statuses[status] ?? { label: status, className: "bg-gray-100 text-gray-700" }
    return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${info.className}`}>{info.label}</span>
}

export default StatusBadge
