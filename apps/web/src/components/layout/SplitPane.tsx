import React, { useRef, useState, useCallback, useEffect } from 'react'
import { cn } from '@/utils/cn'

interface SplitPaneProps {
  left: React.ReactNode
  right: React.ReactNode
  className?: string
  initialLeftWidth?: number
  minLeftWidth?: number
  minRightWidth?: number
}

export default function SplitPane({
  left,
  right,
  className,
  initialLeftWidth = 50,
  minLeftWidth = 200,
  minRightWidth = 200,
}: SplitPaneProps) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percent = (x / rect.width) * 100
      const minLeft = (minLeftWidth / rect.width) * 100
      const maxLeft = 100 - (minRightWidth / rect.width) * 100
      setLeftWidth(Math.max(minLeft, Math.min(maxLeft, percent)))
    },
    [isDragging, minLeftWidth, minRightWidth]
  )

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div
      ref={containerRef}
      className={cn('flex w-full h-full overflow-hidden', className)}
    >
      <div
        style={{ width: `${leftWidth}%` }}
        className="h-full overflow-hidden"
      >
        {left}
      </div>
      <div
        className="w-1 cursor-col-resize bg-border hover:bg-primary/20 active:bg-primary/40 transition-colors flex-shrink-0 relative z-10"
        onMouseDown={handleMouseDown}
      />
      <div
        style={{ width: `${100 - leftWidth}%` }}
        className="h-full overflow-hidden"
      >
        {right}
      </div>
    </div>
  )
}
