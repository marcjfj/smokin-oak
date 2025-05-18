'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { MaximizeIcon, MinimizeIcon, ZoomInIcon, StickyNoteIcon } from 'lucide-react'
import { Slider } from '@/components/ui/slider'

interface FloatingMenuProps {
  zoomLevel: number
  onZoomChange: (zoom: number) => void
  onAddStickyNote: () => void
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({
  zoomLevel,
  onZoomChange,
  onAddStickyNote,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const mouseOverMenuRef = useRef(false)

  const hideMenu = useCallback(() => {
    setIsVisible(false)
  }, [])

  const scheduleHideMenu = useCallback(() => {
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current)
    }
    activityTimerRef.current = setTimeout(hideMenu, 3000)
  }, [hideMenu])

  const activateMenu = useCallback(() => {
    setIsVisible(true)
    if (!mouseOverMenuRef.current) {
      scheduleHideMenu()
    }
  }, [scheduleHideMenu])

  const handleFullScreenChange = useCallback(() => {
    setIsFullScreen(document.fullscreenElement != null)
  }, [])

  useEffect(() => {
    const handleMouseMove = () => {
      activateMenu()
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('fullscreenchange', handleFullScreenChange)

    // Initial check
    handleFullScreenChange()
    // Show menu initially and start timer
    activateMenu()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('fullscreenchange', handleFullScreenChange)
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current)
      }
    }
  }, [activateMenu, handleFullScreenChange])

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const handleMenuMouseEnter = () => {
    mouseOverMenuRef.current = true
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current)
    }
  }

  const handleMenuMouseLeave = () => {
    mouseOverMenuRef.current = false
    scheduleHideMenu()
  }

  return (
    <div
      onMouseEnter={handleMenuMouseEnter}
      onMouseLeave={handleMenuMouseLeave}
      className={`fixed bottom-4 right-1/2 translate-x-1/2 p-3 bg-neutral-800 bg-opacity-90 backdrop-blur-md rounded-lg shadow-xl transition-all duration-300 ease-in-out flex items-center space-x-3 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <button
        onClick={toggleFullScreen}
        className="p-2 text-neutral-200 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-md transition-colors"
        aria-label={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullScreen ? <MinimizeIcon size={20} /> : <MaximizeIcon size={20} />}
      </button>

      <div className="flex items-center space-x-2 text-neutral-200">
        <ZoomInIcon size={20} />
        <Slider
          value={[zoomLevel]}
          onValueChange={(value) => onZoomChange(value[0])}
          min={50}
          max={200}
          step={1}
          className="w-32 cursor-pointer [&>span:first-child]:h-1.5 [&>span:first-child>span:first-child]:h-1.5 [&>span:first-child>span:first-child]:bg-yellow-500 [&>span:first-child_span_button]:bg-yellow-400 [&>span:first-child_span_button]:w-4 [&>span:first-child_span_button]:h-4 [&>span:first-child_span_button:focus-visible]:ring-yellow-600"
          aria-label="Zoom slider"
        />
      </div>
      {/* Add more buttons here later */}
      <button
        onClick={onAddStickyNote}
        className="p-2 text-neutral-200 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-md transition-colors"
        aria-label="Add Sticky Note"
      >
        <StickyNoteIcon size={20} />
      </button>
    </div>
  )
}

export default FloatingMenu
