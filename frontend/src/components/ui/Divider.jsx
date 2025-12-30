export default function Divider({ text }) {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      {text && (
        <span className="font-fantasy text-parchment/50 text-sm tracking-wider uppercase">
          {text}
        </span>
      )}
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </div>
  )
}
