import { useEffect, useState } from 'react'

/**
 * Estado de conexão derivado de `navigator.onLine` e dos eventos
 * `online`/`offline`. Não é 100% preciso (alguns SOs só disparam
 * quando o adaptador de rede desconecta), mas é o sinal padrão e
 * suficiente para indicar ao usuário do PWA que está sem internet.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState<boolean>(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )

  useEffect(() => {
    function on()  { setOnline(true) }
    function off() { setOnline(false) }
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online',  on)
      window.removeEventListener('offline', off)
    }
  }, [])

  return online
}
