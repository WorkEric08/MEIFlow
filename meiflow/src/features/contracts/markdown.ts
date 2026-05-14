/**
 * Renderizador Markdown minimalista para contratos.
 * Suporta: # headings, **bold**, listas, --- divider, parágrafos.
 * Zero dependências externas — alinhado com a regra de zero over-engineering.
 */

export function renderMarkdown(md: string): string {
  const lines = md.split('\n')
  const html: string[] = []
  let inList = false

  for (const raw of lines) {
    const line = raw.trimEnd()

    // Heading 1
    if (line.startsWith('# ')) {
      if (inList) { html.push('</ul>'); inList = false }
      html.push(`<h1>${inline(line.slice(2))}</h1>`)
      continue
    }

    // Heading 2
    if (line.startsWith('## ')) {
      if (inList) { html.push('</ul>'); inList = false }
      html.push(`<h2>${inline(line.slice(3))}</h2>`)
      continue
    }

    // Heading 3
    if (line.startsWith('### ')) {
      if (inList) { html.push('</ul>'); inList = false }
      html.push(`<h3>${inline(line.slice(4))}</h3>`)
      continue
    }

    // HR
    if (line === '---') {
      if (inList) { html.push('</ul>'); inList = false }
      html.push('<hr>')
      continue
    }

    // List item
    if (line.startsWith('- ')) {
      if (!inList) { html.push('<ul>'); inList = true }
      html.push(`<li>${inline(line.slice(2))}</li>`)
      continue
    }

    // Empty line
    if (line.trim() === '') {
      if (inList) { html.push('</ul>'); inList = false }
      continue
    }

    // Paragraph
    if (inList) { html.push('</ul>'); inList = false }
    html.push(`<p>${inline(line)}</p>`)
  }

  if (inList) html.push('</ul>')
  return html.join('\n')
}

function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
}
