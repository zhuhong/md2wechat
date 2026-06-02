import { useEffect, useRef } from 'react'

export function useAutoSave(
  content: string,
  saveFn: (content: string) => void,
  delay = 3000
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      saveFn(content)
    }, delay)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [content, saveFn, delay])
}
