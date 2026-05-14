import { Check } from 'lucide-react'
import { ACCENT_COLORS } from '../types'

interface Props {
  value: string
  onChange: (color: string) => void
}

export default function AccentColorPicker({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {ACCENT_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          aria-label={`Cor ${color.label}`}
          onClick={() => onChange(color.value)}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-fast hover:scale-110"
          style={{
            background: color.value,
            outline: value === color.value ? `2px solid ${color.value}` : 'none',
            outlineOffset: '2px',
          }}
        >
          {value === color.value && <Check size={12} color="#fff" />}
        </button>
      ))}
    </div>
  )
}
