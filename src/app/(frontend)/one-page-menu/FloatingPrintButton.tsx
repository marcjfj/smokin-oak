'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { PrinterIcon } from 'lucide-react'

const FloatingPrintButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const mouseOverButtonRef = useRef(false)

  const hideButton = useCallback(() => {
    if (!mouseOverButtonRef.current) {
      setIsVisible(false)
    }
  }, [])

  const scheduleHideButton = useCallback(() => {
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current)
    }
    activityTimerRef.current = setTimeout(hideButton, 3000)
  }, [hideButton])

  const activateButton = useCallback(() => {
    setIsVisible(true)
    scheduleHideButton()
  }, [scheduleHideButton])

  useEffect(() => {
    const handleMouseMove = () => {
      activateButton()
    }

    window.addEventListener('mousemove', handleMouseMove)
    activateButton()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current)
      }
    }
  }, [activateButton])

  const handleMouseEnter = () => {
    mouseOverButtonRef.current = true
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current)
    }
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    mouseOverButtonRef.current = false
    scheduleHideButton()
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`no-print fixed bottom-4 right-4 p-3 bg-neutral-800 bg-opacity-90 backdrop-blur-md rounded-lg shadow-xl transition-all duration-300 ease-in-out flex items-center space-x-3 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <button
        onClick={handlePrint}
        className="p-2 text-neutral-200 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-md transition-colors"
        aria-label="Print Menu"
      >
        <PrinterIcon size={24} />
      </button>
    </div>
  )
}

export default FloatingPrintButton
