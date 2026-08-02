export default function SampleFallback({ sampleOutput, onOpenSettings }) {
  return (
    <div className="card" style={{ borderStyle: 'dashed' }}>
      <p className="eyebrow text-faint">Sample output (no key connected)</p>
      <p className="text-dim small mt-8" style={{ lineHeight: 1.6 }}>{sampleOutput}</p>
      <button className="btn btn-ghost btn-sm mt-16" onClick={onOpenSettings}>
        Connect an API key for live results
      </button>
    </div>
  )
}
