// A small beveled "inventory slot" frame, styled after NWN's icon slots,
// used to present class and skill glyphs consistently across the app.
const SIZES = {
  sm: 'w-5 h-5 text-xs',
  md: 'w-7 h-7 text-sm',
  lg: 'w-12 h-12 text-2xl',
}

export default function IconSlot({ icon, size = 'md', className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-sm shrink-0 ${SIZES[size]} ${className}`}
      style={{
        background: 'linear-gradient(160deg, #2E2414 0%, #1D150A 100%)',
        border: '1px solid #4A3520',
        borderTopColor: '#6B5630',
        borderLeftColor: '#5A4526',
        boxShadow: 'inset 0 0 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,168,76,0.15)',
      }}
    >
      {icon}
    </span>
  )
}
