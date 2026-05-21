import { useRef, useEffect } from 'react'

/**
 * Input de telefone brasileiro com máscara automática `(XX) XXXXX-XXXX`.
 *
 * Regras:
 * - Aceita até 11 dígitos (DDD + 9 + 8 dígitos do número, padrão móvel).
 * - Insere o `9` após o DDD automaticamente conforme o usuário digita.
 * - Se o usuário apagar manualmente o `9` (com backspace/delete no caractere `9`
 *   da posição correta), a máscara não o reinsere — permitindo guardar telefones
 *   antigos sem o nono dígito.
 * - Limpar o campo reativa a regra de inserir o `9`.
 * - Os parênteses, espaço e hífen são exibidos automaticamente conforme digita.
 */

const MAX_DIGITS = 11

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: string
  onChange: (value: string) => void
}

export default function PhoneInput({ value, onChange, placeholder, ...rest }: Props) {
  // Flag que decide se devemos auto-inserir o `9` após o DDD.
  // Inicializa com base no valor recebido: se já tem 3+ dígitos e o 3º não é `9`,
  // assume que o usuário tem um número sem o nono dígito e respeita essa escolha.
  const keepNineRef = useRef(true)

  useEffect(() => {
    const initial = (value ?? '').replace(/\D/g, '')
    if (initial.length >= 3 && initial[2] !== '9') {
      keepNineRef.current = false
    }
    // só na montagem
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    const newDigits = raw.replace(/\D/g, '').slice(0, MAX_DIGITS)
    const prevDigits = (value ?? '').replace(/\D/g, '')

    // Campo limpado → reseta a regra do `9`
    if (newDigits.length === 0) {
      keepNineRef.current = true
      onChange('')
      return
    }

    // Usuário apagou o `9` da posição 2 (caractere depois do DDD)
    // mas manteve algum dígito na posição 2 — opta por não usar o nono dígito.
    if (
      prevDigits.length > newDigits.length &&
      prevDigits[2] === '9' &&
      newDigits.length >= 3 &&
      newDigits[2] !== '9'
    ) {
      keepNineRef.current = false
    }

    // Usuário pasteou/digitou um número com `9` no lugar — reativa a regra
    if (newDigits.length >= 3 && newDigits[2] === '9') {
      keepNineRef.current = true
    }

    // Auto-inserir `9` se a flag está ativa e ainda não está lá
    let finalDigits = newDigits
    if (keepNineRef.current && finalDigits.length >= 3 && finalDigits[2] !== '9') {
      finalDigits = (finalDigits.slice(0, 2) + '9' + finalDigits.slice(2)).slice(0, MAX_DIGITS)
    }

    onChange(formatPhoneDigits(finalDigits))
  }

  return (
    <input
      {...rest}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      value={value}
      onChange={handleChange}
      placeholder={placeholder ?? '(00) 90000-0000'}
      maxLength={15}
    />
  )
}

/** Aplica a máscara `(XX) XXXXX-XXXX` ao conjunto de dígitos. */
function formatPhoneDigits(digits: string): string {
  if (!digits) return ''
  const len = digits.length
  if (len === 1) return `(${digits}`
  if (len === 2) return `(${digits}) `

  const ddd = digits.slice(0, 2)
  const rest = digits.slice(2)

  if (rest.length <= 5) return `(${ddd}) ${rest}`
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`
}
