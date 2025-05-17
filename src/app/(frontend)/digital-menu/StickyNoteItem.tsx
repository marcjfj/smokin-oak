'use client'

import React, { useState } from 'react'
import { Rnd, type Position, type DraggableData, type ResizableDelta } from 'react-rnd'
import { XIcon, GripVerticalIcon } from 'lucide-react'

export interface StickyNoteData {
  id: string
  text: string
  x: number
  y: number
  width: number | string // react-rnd allows string for percentages
  height: number | string // react-rnd allows string for percentages
  color?: string
  zIndex: number
}

interface StickyNoteItemProps {
  note: StickyNoteData
  onUpdate: (id: string, updates: Partial<StickyNoteData>) => void
  onDelete: (id: string) => void
  onFocus: (id: string) => void // To bring to front
  zoomFactor: number // New prop
}

const StickyNoteItem: React.FC<StickyNoteItemProps> = ({
  note,
  onUpdate,
  onDelete,
  onFocus,
  zoomFactor, // Destructure new prop
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [currentText, setCurrentText] = useState(note.text)
  const [isMouseOver, setIsMouseOver] = useState(false)

  const handleDragStop = (_e: any, d: DraggableData) => {
    onUpdate(note.id, { x: d.x, y: d.y })
  }

  const handleResizeStop = (
    _e: MouseEvent | TouchEvent,
    _direction: any, // Direction type can be imported if needed, but often 'any' is fine for simplicity
    ref: HTMLElement, // react-rnd provides HTMLElement here
    _delta: ResizableDelta,
    position: Position,
  ) => {
    onUpdate(note.id, {
      width: ref.style.width, // Use ref.style.width and ref.style.height for string values
      height: ref.style.height,
      x: position.x,
      y: position.y,
    })
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentText(e.target.value)
  }

  const handleTextBlur = () => {
    setIsEditing(false)
    onUpdate(note.id, { text: currentText })
  }

  const handleDoubleClick = () => {
    setIsEditing(true)
  }

  return (
    <Rnd
      size={{ width: note.width, height: note.height }}
      position={{ x: note.x, y: note.y }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      onMouseDown={() => onFocus(note.id)}
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
      minWidth={150}
      minHeight={100}
      bounds="parent"
      style={{ zIndex: note.zIndex }}
      className="shadow-xl border border-neutral-600 overflow-hidden flex flex-col"
      drag-handle=".drag-handle"
    >
      {isMouseOver && (
        <div
          className={`drag-handle cursor-move bg-yellow-500 p-1.5 flex justify-between items-center`}
          onDoubleClick={(e) => e.stopPropagation()} // Prevent double click on handle from triggering edit
        >
          <GripVerticalIcon size={18} className="text-neutral-800" />
          <button
            onClick={() => onDelete(note.id)}
            className="p-0.5 text-neutral-800 hover:text-red-700 rounded-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            aria-label="Delete sticky note"
          >
            <XIcon size={16} />
          </button>
        </div>
      )}
      <div
        className="flex-grow p-2 bg-yellow-300 h-full"
        onDoubleClick={handleDoubleClick}
        onClick={() => onFocus(note.id)} // Also bring to front on click
        style={{ fontSize: `calc(18px * ${zoomFactor})` }} // Apply zoom to container for relative font sizing
      >
        {isEditing ? (
          <textarea
            value={currentText}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            className="w-full h-full resize-none bg-transparent text-neutral-800 focus:outline-none p-1" // Removed text-sm, will be handled by parent
            style={{ fontSize: 'inherit' }} // Inherit scaled font size
            autoFocus
            onClick={(e) => e.stopPropagation()} // Prevent clicks on textarea from bubbling to RND mousedown
          />
        ) : (
          <div
            className="w-full h-full whitespace-pre-wrap overflow-y-auto text-neutral-800 p-1" // Removed text-sm
            style={{ wordBreak: 'break-word', fontSize: 'inherit' }} // Inherit scaled font size
          >
            {currentText || 'Double-click to edit...'}
          </div>
        )}
      </div>
    </Rnd>
  )
}

export default StickyNoteItem
