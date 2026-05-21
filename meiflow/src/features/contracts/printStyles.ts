/**
 * Estilos do documento de contrato — usados tanto na visualização
 * quanto na exportação para PDF.
 */

export const CONTRACT_DOCUMENT_STYLES = `
  #contract-print { font-family: Georgia, 'Times New Roman', serif; color: #0D1117; }
  #contract-print h1 { font-size: 22px; font-weight: 800; margin: 0 0 6px; color: #0D1117; line-height: 1.25; letter-spacing: -0.02em; }
  #contract-print h2 { font-size: 16px; font-weight: 700; margin: 28px 0 8px; padding-top: 18px; border-top: 1px solid #e5e7eb; color: #0D1117; line-height: 1.35; }
  #contract-print h3 { font-size: 14px; font-weight: 700; margin: 18px 0 6px; color: #1e293b; }
  #contract-print p { font-size: 14px; line-height: 1.8; margin-bottom: 12px; color: #334155; }
  #contract-print ul, #contract-print ol { padding-left: 22px; margin-bottom: 12px; }
  #contract-print li { font-size: 14px; line-height: 1.65; color: #334155; margin-bottom: 5px; }
  #contract-print strong { font-weight: 700; color: #0D1117; }
  #contract-print em { font-style: italic; }
  #contract-print u { text-decoration: underline; }
  #contract-print blockquote { border-left: 3px solid #94A3B8; padding: 6px 0 6px 16px; margin: 14px 0; color: #475569; font-style: italic; }
  #contract-print a { color: #1A65C0; text-decoration: underline; }
  #contract-print code { font-family: ui-monospace, 'Courier New', monospace; font-size: 12px; background: #f8fafc; padding: 1px 5px; border-radius: 3px; border: 1px solid #e2e8f0; }
  #contract-print hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
`

/**
 * Para o PdfPreviewModal — o wrapper já é estilizado lá, então aqui
 * só os filhos precisam de styling.
 */
export const CONTRACT_PDF_STYLES = `
  h1 { font-size: 22px; font-weight: 800; margin: 0 0 6px; line-height: 1.25; letter-spacing: -0.02em; }
  h2 { font-size: 16px; font-weight: 700; margin: 28px 0 8px; padding-top: 18px; border-top: 1px solid #e5e7eb; line-height: 1.35; }
  h3 { font-size: 14px; font-weight: 700; margin: 18px 0 6px; color: #1e293b; }
  p { font-size: 14px; line-height: 1.8; margin-bottom: 12px; color: #334155; }
  ul, ol { padding-left: 22px; margin-bottom: 12px; }
  li { font-size: 14px; line-height: 1.65; color: #334155; margin-bottom: 5px; }
  strong { font-weight: 700; color: #0D1117; }
  em { font-style: italic; }
  u { text-decoration: underline; }
  blockquote { border-left: 3px solid #94A3B8; padding: 6px 0 6px 16px; margin: 14px 0; color: #475569; font-style: italic; }
  a { color: #1A65C0; text-decoration: underline; }
  code { font-family: ui-monospace, 'Courier New', monospace; font-size: 12px; background: #f8fafc; padding: 1px 5px; border-radius: 3px; border: 1px solid #e2e8f0; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
`
