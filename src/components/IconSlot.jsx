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
        background: '#050505',
        border: '1px solid #8F5A2B',
        borderRadius: '5px',
        boxShadow: 'inset 0 0 0 1px #000, inset 0 0 4px rgba(0,0,0,0.8)',
      }}
    >
      {icon}
    </span>
  )
}
