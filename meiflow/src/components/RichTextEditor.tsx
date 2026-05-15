import { useEffect, useState, useRef } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus,
  Link as LinkIcon, Undo2, Redo2,
  AlignLeft, AlignCenter, AlignRight,
  Plus, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface VariableOption {
  key: string
  label: string
  /** Texto a inserir; se omitido, usa `{{key}}` para interpolar depois */
  value?: string
}

interface Props {
  value: string
  onChange: (html: string) => void
  variables?: VariableOption[]
  placeholder?: string
  /** Limita a altura do canvas e ativa scroll interno (usado no modal) */
  bounded?: boolean
}

/**
 * Editor WYSIWYG estilo Word/Google Docs.
 * — Barra de ferramentas grande, com rótulos visíveis e ícones reconhecíveis.
 * — Atalhos: Ctrl+B/I/U para formatação básica, Ctrl+Z/Y para undo/redo.
 * — Variáveis: chip ao lado do conteúdo (cliente, projeto, etc.) inseridas como texto.
 */
export default function RichTextEditor({
  value, onChange, variables = [], placeholder, bounded = false,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // dropcursor padrão de StarterKit conflita em alguns navegadores; mantém defaults
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Placeholder.configure({ placeholder: placeholder ?? 'Comece a escrever seu contrato…' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'tiptap-canvas prose prose-sm max-w-none focus:outline-none',
      },
    },
  })

  // Sincroniza quando o valor é trocado externamente (ex: aplicar template)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value && value !== current) editor.commands.setContent(value, false)
  }, [value, editor])

  if (!editor) return null

  return (
    <div
      className="flex flex-col rounded-card border overflow-hidden"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-2)' }}
    >
      <Toolbar editor={editor} variables={variables} />
      <div
        className={cn('flex-1 overflow-auto', bounded && 'max-h-[60vh]')}
        style={{ background: 'var(--bg-0)' }}
      >
        {/* Canvas de papel — A4-like, centralizado */}
        <div className="mx-auto my-4 sm:my-6 paper-canvas">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}

// ─── Toolbar ─────────────────────────────────────────────────────
function Toolbar({ editor, variables }: { editor: Editor; variables: VariableOption[] }) {
  const [varsOpen, setVarsOpen] = useState(false)
  const varsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (varsRef.current && !varsRef.current.contains(e.target as Node)) setVarsOpen(false)
    }
    if (varsOpen) document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [varsOpen])

  function insertVariable(v: VariableOption) {
    const text = v.value ?? `{{${v.key}}}`
    editor.chain().focus().insertContent(text).run()
    setVarsOpen(false)
  }

  function addLink() {
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Endereço do link', prev ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b sticky top-0 z-10"
      style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}
    >
      <Group>
        <Btn label="Desfazer (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 size={16} />
        </Btn>
        <Btn label="Refazer (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 size={16} />
        </Btn>
      </Group>

      <Divider />

      <Group>
        <Btn label="Título grande" active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 size={16} />
        </Btn>
        <Btn label="Subtítulo" active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={16} />
        </Btn>
        <Btn label="Subtítulo menor" active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={16} />
        </Btn>
      </Group>

      <Divider />

      <Group>
        <Btn label="Negrito (Ctrl+B)" active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </Btn>
        <Btn label="Itálico (Ctrl+I)" active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </Btn>
        <Btn label="Sublinhado (Ctrl+U)" active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={16} />
        </Btn>
        <Btn label="Tachado" active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={16} />
        </Btn>
      </Group>

      <Divider />

      <Group>
        <Btn label="Lista com marcadores" active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={16} />
        </Btn>
        <Btn label="Lista numerada" active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={16} />
        </Btn>
        <Btn label="Citação" active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={16} />
        </Btn>
        <Btn label="Linha divisória" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={16} />
        </Btn>
      </Group>

      <Divider />

      <Group>
        <Btn label="Alinhar à esquerda" active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft size={16} />
        </Btn>
        <Btn label="Centralizar" active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter size={16} />
        </Btn>
        <Btn label="Alinhar à direita" active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <AlignRight size={16} />
        </Btn>
      </Group>

      <Divider />

      <Group>
        <Btn label="Inserir link" active={editor.isActive('link')} onClick={addLink}>
          <LinkIcon size={16} />
        </Btn>
      </Group>

      {variables.length > 0 && (
        <>
          <Divider />
          <div className="relative" ref={varsRef}>
            <button
              type="button"
              onClick={() => setVarsOpen((v) => !v)}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-input text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Inserir dado</span>
              <span className="sm:hidden">Dado</span>
              <ChevronDown size={12} />
            </button>
            {varsOpen && (
              <div
                className="absolute top-full right-0 mt-1 w-56 rounded-card border overflow-hidden z-20"
                style={{ background: 'var(--bg-2)', borderColor: 'var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}
              >
                {variables.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="w-full text-left px-3 py-2.5 text-sm transition-all hover:opacity-80"
                    style={{ color: 'var(--text-primary)', background: 'transparent' }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Group({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>
}

function Divider() {
  return <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />
}

function Btn({
  children, onClick, active, disabled, label,
}: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        'flex items-center justify-center w-9 h-8 rounded-input transition-all',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        !disabled && 'hover:opacity-80',
      )}
      style={{
        background: active ? 'var(--primary-subtle)' : 'transparent',
        color: active ? 'var(--primary)' : 'var(--text-secondary)',
      }}
    >
      {children}
    </button>
  )
}
