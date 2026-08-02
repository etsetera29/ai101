export default function ClearKeyButton({ onClear, label = 'Clear this key' }) {
  return (
    <button className="btn btn-danger btn-sm" onClick={onClear}>
      {label}
    </button>
  )
}
