interface Props { title: string; description: string }
export default function PagePlaceholder({ title, description }: Props) {
  return (
    <div className="flex flex-col gap-2 animate-fade-in">
      <h1 className="text-display" style={{ color: 'var(--text-primary)' }}>{title}</h1>
      <p style={{ color: 'var(--text-secondary)' }}>{description}</p>
    </div>
  )
}
