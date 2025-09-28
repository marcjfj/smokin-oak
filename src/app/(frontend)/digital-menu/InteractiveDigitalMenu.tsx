'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from "next/legacy/image"
import type {
  Media,
  MenuItem as PayloadMenuItem,
  Category as PayloadCategory,
} from '@/payload-types'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { goblinOne } from '@/lib/fonts'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import type { Identifier, XYCoord } from 'dnd-core'
import FloatingMenu from './FloatingMenu'
import StickyNoteItem, { type StickyNoteData } from './StickyNoteItem'
import { v4 as uuidv4 } from 'uuid'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || ''
const NUM_COLUMNS = 3 // Define the number of columns
const CATEGORY_LAYOUT_STORAGE_KEY = 'digitalMenuCategoryLayout' // Renamed for clarity
const STICKY_NOTES_STORAGE_KEY = 'digitalMenuStickyNotes' // Key for sticky notes

// Define the structure of a populated image (from the 'media' collection)
interface PopulatedImage extends Omit<Media, 'id'> {
  id: string
  url: string
  alt: string
}

// Define the structure of a category from the 'categories' collection
interface EnrichedCategory {
  id: string
  name: string
  description?: string | null
  order: number
}

// Define the structure of a menu item from the 'menu-items' collection
export interface MenuItem
  extends Omit<PayloadMenuItem, 'id' | 'image' | 'category' | 'description'> {
  id: string
  name: string
  price?: number | null
  category: EnrichedCategory
  image?: PopulatedImage | null
  isSoldOut: boolean
  description?: SerializedEditorState | null
  subItems?: Array<{
    id?: string | null
    name: string
    price: number
  }> | null
  order: number
  updatedAt: string
  createdAt: string
}

interface GroupedItem {
  items: MenuItem[]
  categoryDetails: EnrichedCategory
}

interface DraggableCategoryProps {
  id: string
  index: number
  group: GroupedItem
  moveCategory: (
    draggedCategoryKey: string,
    sourceColumnIndex: number,
    sourceItemIndexInColumn: number,
    targetColumnIndex: number,
    targetItemIndexInColumn: number,
  ) => void
  children: React.ReactNode
  isOverallDragActive: boolean
  onDragStart: () => void
  onDragEnd: () => void
  columnIndex: number // New prop
  itemIndexInColumn: number // New prop
  categoryKey: string // New prop
}

const ItemTypes = {
  CATEGORY: 'category',
}

const DraggableCategory: React.FC<DraggableCategoryProps> = (props) => {
  const {
    id,
    group,
    moveCategory,
    children,
    isOverallDragActive,
    onDragStart,
    onDragEnd,
    columnIndex,
    itemIndexInColumn,
    categoryKey,
  } = props
  const ref = useRef<HTMLDivElement>(null)
  const [{ handlerId }, drop] = useDrop<
    {
      categoryKey: string
      originalColumnIndex: number
      originalItemIndexInColumn: number
    },
    void,
    { handlerId: Identifier | null }
  >({
    accept: ItemTypes.CATEGORY,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item, monitor) {
      if (!ref.current) {
        return
      }
      const dragColumnIndex = item.originalColumnIndex
      const dragItemIndexInColumn = item.originalItemIndexInColumn
      const hoverColumnIndex = columnIndex
      const hoverItemIndexInColumn = itemIndexInColumn

      if (
        dragColumnIndex === hoverColumnIndex &&
        dragItemIndexInColumn === hoverItemIndexInColumn
      ) {
        return
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      if (
        dragColumnIndex === hoverColumnIndex &&
        dragItemIndexInColumn < hoverItemIndexInColumn &&
        hoverClientY < hoverMiddleY
      ) {
        return
      }

      if (
        dragColumnIndex === hoverColumnIndex &&
        dragItemIndexInColumn > hoverItemIndexInColumn &&
        hoverClientY > hoverMiddleY
      ) {
        return
      }

      moveCategory(
        item.categoryKey,
        dragColumnIndex,
        dragItemIndexInColumn,
        hoverColumnIndex,
        hoverItemIndexInColumn,
      )

      item.originalColumnIndex = hoverColumnIndex
      item.originalItemIndexInColumn = hoverItemIndexInColumn
    },
  })

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.CATEGORY,
      item: () => {
        onDragStart()
        return {
          categoryKey,
          originalColumnIndex: columnIndex,
          originalItemIndexInColumn: itemIndexInColumn,
        }
      },
      end: (draggedItem, monitor) => {
        onDragEnd()
      },
      collect: (monitor: any) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [categoryKey, columnIndex, itemIndexInColumn, onDragStart, onDragEnd],
  )

  const opacity = isDragging ? 0.4 : 1
  drag(drop(ref))

  const isPotentialTarget = isOverallDragActive && !isDragging

  return (
    <div
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className={`break-inside-avoid-column cursor-move
                  ${isPotentialTarget ? 'border-dashed border-neutral-600 border-[length:calc(2px*var(--zoom-factor))]' : 'border-transparent border-[length:calc(2px*var(--zoom-factor))]'}
                  mb-[calc(1.5rem*var(--zoom-factor))] rounded-[calc(0.375rem*var(--zoom-factor))]`}
    >
      {children}
    </div>
  )
}

// New component for empty drop targets
interface EmptyDropTargetProps {
  columnIndex: number
  moveCategory: (
    draggedCategoryKey: string,
    sourceColumnIndex: number,
    sourceItemIndexInColumn: number,
    targetColumnIndex: number,
    targetItemIndexInColumn: number,
  ) => void
  isOverallDragActive: boolean
}

const EmptyDropTarget: React.FC<EmptyDropTargetProps> = ({
  columnIndex,
  moveCategory,
  isOverallDragActive,
}) => {
  const emptyTargetRef = useRef<HTMLDivElement>(null) // Create a ref
  const [{ isOver, canDrop }, dropConnector] = useDrop({
    accept: ItemTypes.CATEGORY,
    drop: (item: {
      categoryKey: string
      originalColumnIndex: number
      originalItemIndexInColumn: number
    }) => {
      // Move item to the beginning of this (previously empty) column
      moveCategory(
        item.categoryKey,
        item.originalColumnIndex,
        item.originalItemIndexInColumn,
        columnIndex,
        0, // Place at the beginning of the target column
      )
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  // Connect the drop target to the ref
  dropConnector(emptyTargetRef)

  const isActiveDropZone = isOverallDragActive && canDrop

  return (
    <div
      ref={emptyTargetRef} // Use the created ref here
      className={`w-full flex-grow h-full min-h-[calc(6rem*var(--zoom-factor))] p-[calc(1rem*var(--zoom-factor))] border-[length:calc(2px*var(--zoom-factor))] rounded-[calc(0.375rem*var(--zoom-factor))] flex items-center justify-center transition-colors duration-150
                  ${isActiveDropZone && isOver ? 'border-yellow-500 bg-neutral-800' : isActiveDropZone ? 'border-dashed border-neutral-600' : 'border-dashed border-neutral-700'}`}
    >
      <p
        className={`text-[calc(0.875rem*var(--zoom-factor))] ${isActiveDropZone && isOver ? 'text-yellow-400' : 'text-neutral-500'}`}
      >
        {isActiveDropZone && isOver
          ? 'Drop Category Here'
          : isActiveDropZone
            ? 'Move to this column'
            : 'Empty Column'}
      </p>
    </div>
  )
}

// Component for additional drop targets (e.g., end of column)
interface AdditionalDropTargetProps {
  columnIndex: number
  targetItemIndexInColumn: number
  moveCategory: (
    draggedCategoryKey: string,
    sourceColumnIndex: number,
    sourceItemIndexInColumn: number,
    targetColumnIndex: number,
    targetItemIndexInColumn: number,
  ) => void
  isOverallDragActive: boolean
  label: string
}

const AdditionalDropTarget: React.FC<AdditionalDropTargetProps> = ({
  columnIndex,
  targetItemIndexInColumn,
  moveCategory,
  isOverallDragActive,
  label,
}) => {
  const dropRef = useRef<HTMLDivElement>(null)
  const [{ isOver, canDrop }, connectDropTarget] = useDrop({
    accept: ItemTypes.CATEGORY,
    drop: (item: {
      categoryKey: string
      originalColumnIndex: number
      originalItemIndexInColumn: number
    }) => {
      moveCategory(
        item.categoryKey,
        item.originalColumnIndex,
        item.originalItemIndexInColumn,
        columnIndex,
        targetItemIndexInColumn,
      )
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  connectDropTarget(dropRef)

  if (!isOverallDragActive) {
    return null // Only render when a drag is active overall
  }

  const isActiveDropZone = canDrop

  return (
    <div
      ref={dropRef}
      className={`w-full min-h-[calc(6rem*var(--zoom-factor))] p-[calc(1rem*var(--zoom-factor))] mt-[calc(0.5rem*var(--zoom-factor))] border-[length:calc(2px*var(--zoom-factor))] rounded-[calc(0.375rem*var(--zoom-factor))] flex items-center justify-center transition-colors duration-150
                  ${isActiveDropZone && isOver ? 'border-yellow-500 bg-neutral-800' : isActiveDropZone ? 'border-dashed border-neutral-600' : 'border-dashed border-neutral-700 opacity-50'}`}
    >
      <p
        className={`text-[calc(0.875rem*var(--zoom-factor))] ${isActiveDropZone && isOver ? 'text-yellow-400' : 'text-neutral-500'}`}
      >
        {label}
      </p>
    </div>
  )
}

const LOCAL_STORAGE_KEY = 'digitalMenuCategoryLayout' // Updated key

interface InteractiveDigitalMenuProps {
  initialMenuItems: MenuItem[]
}

export default function InteractiveDigitalMenu({ initialMenuItems }: InteractiveDigitalMenuProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems)
  const [columns, setColumns] = useState<Array<Array<[string, GroupedItem]>>>([])
  const [isOverallDragActive, setIsOverallDragActive] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100) // Default zoom 100%
  const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>([])
  const [nextZIndex, setNextZIndex] = useState(1000) // Initial z-index for sticky notes

  // Load sticky notes from local storage on mount
  useEffect(() => {
    const storedNotesString = localStorage.getItem(STICKY_NOTES_STORAGE_KEY)
    if (storedNotesString) {
      try {
        const loadedNotes = JSON.parse(storedNotesString) as StickyNoteData[]
        setStickyNotes(loadedNotes)
        if (loadedNotes.length > 0) {
          const maxZIndex = Math.max(...loadedNotes.map((note) => note.zIndex || 0), 0)
          setNextZIndex(maxZIndex + 1)
        }
      } catch (e) {
        console.error('Failed to parse sticky notes from local storage', e)
      }
    }
  }, [])

  // Save sticky notes to local storage whenever they change
  useEffect(() => {
    // Don't save an empty array if it was just initialized (prevents overwriting on initial load with no stored data)
    // This check might need refinement based on exact behavior desired on first load without data.
    // For now, we save any change, including an empty array if notes are deleted.
    localStorage.setItem(STICKY_NOTES_STORAGE_KEY, JSON.stringify(stickyNotes))
  }, [stickyNotes])

  const handleDragStart = useCallback(() => {
    setIsOverallDragActive(true)
  }, [])

  const handleDragEnd = useCallback(() => {
    setIsOverallDragActive(false)
  }, [])

  const addStickyNote = useCallback(() => {
    setStickyNotes((prevNotes) => [
      ...prevNotes,
      {
        id: uuidv4(),
        text: 'New Note',
        x: 50, // Initial position
        y: 50,
        width: 200,
        height: 150,
        zIndex: nextZIndex,
      },
    ])
    setNextZIndex((prevZ) => prevZ + 1)
  }, [nextZIndex])

  const updateStickyNote = useCallback((id: string, updates: Partial<StickyNoteData>) => {
    setStickyNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === id ? { ...note, ...updates } : note)),
    )
  }, [])

  const deleteStickyNote = useCallback((id: string) => {
    setStickyNotes((prevNotes) => prevNotes.filter((note) => note.id !== id))
  }, [])

  const focusStickyNote = useCallback(
    (id: string) => {
      setStickyNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === id ? { ...note, zIndex: nextZIndex } : note)),
      )
      setNextZIndex((prevZ) => prevZ + 1)
    },
    [nextZIndex],
  )

  useEffect(() => {
    setMenuItems(initialMenuItems) // Update if props change
  }, [initialMenuItems])

  useEffect(() => {
    if (menuItems.length === 0) {
      setColumns(Array.from({ length: NUM_COLUMNS }, () => []))
      return
    }

    const groupedMenuItems = menuItems.reduce(
      (acc, item) => {
        const categoryKey = item.category.name || 'Uncategorized'
        if (!acc[categoryKey]) {
          acc[categoryKey] = { items: [], categoryDetails: item.category }
        }
        acc[categoryKey].items.push(item)
        return acc
      },
      {} as Record<string, GroupedItem>,
    )

    for (const categoryKey in groupedMenuItems) {
      if (Object.prototype.hasOwnProperty.call(groupedMenuItems, categoryKey)) {
        groupedMenuItems[categoryKey].items.sort((a, b) => a.order - b.order)
      }
    }

    const allCategoryEntries = Object.entries(groupedMenuItems)

    const storedLayoutString = localStorage.getItem(CATEGORY_LAYOUT_STORAGE_KEY) // Use renamed key
    const newColumns: Array<Array<[string, GroupedItem]>> = Array.from(
      { length: NUM_COLUMNS },
      () => [],
    )
    const seenCategoryKeys = new Set<string>()

    if (storedLayoutString) {
      try {
        const storedLayout = JSON.parse(storedLayoutString) as string[][]
        storedLayout.forEach((columnKeys, colIndex) => {
          if (colIndex < NUM_COLUMNS) {
            columnKeys.forEach((key) => {
              if (groupedMenuItems[key]) {
                newColumns[colIndex].push([key, groupedMenuItems[key]])
                seenCategoryKeys.add(key)
              }
            })
          }
        })
      } catch (e) {
        console.error('Failed to parse category layout from local storage', e)
      }
    }

    allCategoryEntries.sort(([, groupA], [, groupB]) => {
      const orderA = groupA.categoryDetails.order ?? Infinity
      const orderB = groupB.categoryDetails.order ?? Infinity
      return orderA - orderB
    })

    allCategoryEntries.forEach(([key, group]) => {
      if (!seenCategoryKeys.has(key)) {
        let shortestColumn = 0
        for (let i = 1; i < NUM_COLUMNS; i++) {
          if (newColumns[i].length < newColumns[shortestColumn].length) {
            shortestColumn = i
          }
        }
        newColumns[shortestColumn].push([key, group])
        seenCategoryKeys.add(key)
      }
    })

    setColumns(newColumns)
    const layoutToStore = newColumns.map((col) => col.map(([key]) => key))
    localStorage.setItem(CATEGORY_LAYOUT_STORAGE_KEY, JSON.stringify(layoutToStore)) // Use renamed key
  }, [menuItems])

  const moveCategory = useCallback(
    (
      draggedCategoryKey: string,
      sourceColumnIndex: number,
      sourceItemIndexInColumn: number,
      targetColumnIndex: number,
      targetItemIndexInColumn: number,
    ) => {
      setColumns((prevColumns) => {
        const newColumns = prevColumns.map((col) => [...col])

        let draggedItem: [string, GroupedItem] | undefined
        if (
          newColumns[sourceColumnIndex] &&
          newColumns[sourceColumnIndex][sourceItemIndexInColumn] &&
          newColumns[sourceColumnIndex][sourceItemIndexInColumn][0] === draggedCategoryKey
        ) {
          ;[draggedItem] = newColumns[sourceColumnIndex].splice(sourceItemIndexInColumn, 1)
        } else {
          console.warn('Dragged item not found at expected source coordinates, searching...')
          for (let i = 0; i < newColumns.length; i++) {
            const itemIdx = newColumns[i].findIndex(([key]) => key === draggedCategoryKey)
            if (itemIdx !== -1) {
              ;[draggedItem] = newColumns[i].splice(itemIdx, 1)
              console.warn(
                `Found item in column ${i} at index ${itemIdx} instead of ${sourceColumnIndex}, ${sourceItemIndexInColumn}`,
              )
              break
            }
          }
        }

        if (!draggedItem) {
          console.error('Could not find dragged item:', draggedCategoryKey)
          return prevColumns
        }

        if (!newColumns[targetColumnIndex]) {
          newColumns[targetColumnIndex] = []
        }
        newColumns[targetColumnIndex].splice(targetItemIndexInColumn, 0, draggedItem)

        const newLayout = newColumns.map((col) => col.map(([key]) => key))
        localStorage.setItem(CATEGORY_LAYOUT_STORAGE_KEY, JSON.stringify(newLayout)) // Use renamed key
        return newColumns
      })
    },
    [],
  )

  if (initialMenuItems.length === 0) {
    return (
      <div className="h-screen max-h-screen overflow-hidden bg-neutral-900 text-neutral-50 px-[calc(1.5rem*var(--zoom-factor))] py-[calc(2rem*var(--zoom-factor))] flex items-center justify-center">
        <p
          className={`text-center text-neutral-300 text-[clamp(calc(0.875rem*var(--zoom-factor)),calc(1.04vw*var(--zoom-factor)),calc(1.5rem*var(--zoom-factor)))]`}
        >
          No menu items available at the moment. Please check back later.
        </p>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className="relative h-screen max-h-screen overflow-auto bg-neutral-900 text-neutral-50 px-[calc(1.5rem*var(--zoom-factor))] py-[calc(2rem*var(--zoom-factor))]"
        style={{ ['--zoom-factor']: zoomLevel / 100 } as React.CSSProperties}
      >
        {stickyNotes.map((note) => (
          <StickyNoteItem
            key={note.id}
            note={note}
            onUpdate={updateStickyNote}
            onDelete={deleteStickyNote}
            onFocus={focusStickyNote}
            zoomFactor={zoomLevel / 100}
          />
        ))}

        {columns.every((col) => col.length === 0) && menuItems.length > 0 ? (
          <div className="flex items-center justify-center h-full">
            <p
              className={`text-center text-neutral-300 text-[clamp(calc(0.875rem*var(--zoom-factor)),calc(1.04vw*var(--zoom-factor)),calc(1.5rem*var(--zoom-factor)))]`}
            >
              Processing menu categories...
            </p>
          </div>
        ) : (
          <div className="flex lg:gap-x-[calc(2.5rem*var(--zoom-factor))] h-full">
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="flex-1 flex flex-col min-w-0">
                {column.length === 0 ? (
                  <EmptyDropTarget
                    columnIndex={columnIndex}
                    moveCategory={moveCategory}
                    isOverallDragActive={isOverallDragActive}
                  />
                ) : (
                  <>
                    {column.map(([categoryKey, group], itemIndexInColumn) => (
                      <DraggableCategory
                        key={categoryKey}
                        id={group.categoryDetails.id}
                        index={itemIndexInColumn}
                        categoryKey={categoryKey}
                        group={group}
                        moveCategory={moveCategory}
                        isOverallDragActive={isOverallDragActive}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        columnIndex={columnIndex}
                        itemIndexInColumn={itemIndexInColumn}
                      >
                        <section className="border-2 border-neutral-800 p-4">
                          <h2
                            className={`font-semibold text-yellow-500 mb-[calc(0.5rem*var(--zoom-factor))] ${goblinOne.className} text-[clamp(calc(1rem*var(--zoom-factor)),calc(1.25vw*var(--zoom-factor)),calc(1.75rem*var(--zoom-factor)))]`}
                          >
                            {group.categoryDetails.name}
                          </h2>
                          {group.categoryDetails.description && (
                            <p
                              className={`text-yellow-400 mb-[calc(1rem*var(--zoom-factor))] italic text-[clamp(calc(0.875rem*var(--zoom-factor)),calc(0.94vw*var(--zoom-factor)),calc(1.25rem*var(--zoom-factor)))]`}
                            >
                              {group.categoryDetails.description}
                            </p>
                          )}
                          {group.items.map((menuItem) => (
                            <div
                              key={menuItem.id}
                              className="flex items-start py-[calc(0.75rem*var(--zoom-factor))] border-b-[length:calc(1px*var(--zoom-factor))] border-neutral-700 last:border-b-0"
                            >
                              <div className="flex-grow">
                                <div
                                  className={`flex justify-between items-baseline ${menuItem.description || (menuItem.subItems && menuItem.subItems.length > 0) ? 'mb-[calc(0.25rem*var(--zoom-factor))]' : 'mb-0'}`}
                                >
                                  <div className="flex items-baseline">
                                    <h3
                                      className={`font-semibold mr-[calc(0.5rem*var(--zoom-factor))] text-[clamp(calc(0.875rem*var(--zoom-factor)),calc(1.04vw*var(--zoom-factor)),calc(1.5rem*var(--zoom-factor)))] ${
                                        menuItem.isSoldOut ? 'text-neutral-500' : 'text-neutral-100'
                                      }`}
                                      title={menuItem.name}
                                    >
                                      {menuItem.name}
                                    </h3>
                                    {menuItem.isSoldOut && (
                                      <span
                                        className={`bg-red-800 text-red-200 uppercase font-semibold whitespace-nowrap px-[calc(0.5rem*var(--zoom-factor))] py-[calc(0.25rem*var(--zoom-factor))] rounded-[calc(0.375rem*var(--zoom-factor))] text-[clamp(calc(0.75rem*var(--zoom-factor)),calc(0.83vw*var(--zoom-factor)),calc(1.125rem*var(--zoom-factor)))]`}
                                      >
                                        Sold Out
                                      </span>
                                    )}
                                  </div>
                                  <p
                                    className={`font-medium ml-[calc(0.75rem*var(--zoom-factor))] whitespace-nowrap text-[clamp(calc(0.875rem*var(--zoom-factor)),calc(1.04vw*var(--zoom-factor)),calc(1.5rem*var(--zoom-factor)))] ${
                                      menuItem.isSoldOut
                                        ? 'text-neutral-500'
                                        : menuItem.price !== null &&
                                            typeof menuItem.price === 'number'
                                          ? 'text-neutral-100'
                                          : 'text-transparent'
                                    }`}
                                  >
                                    {menuItem.price !== null && typeof menuItem.price === 'number'
                                      ? `$${(menuItem.price / 100).toFixed(2)}`
                                      : '\u00A0'}
                                    {/* Non-breaking space */}
                                  </p>
                                </div>
                                {menuItem.description && (
                                  <div
                                    className={`prose prose-invert max-w-none [&_*]:text-balanced [&_p]:my-0 [&_p]:mt-[calc(0.5rem*var(--zoom-factor))] text-[clamp(calc(0.875rem*var(--zoom-factor)),calc(0.94vw*var(--zoom-factor)),calc(1.25rem*var(--zoom-factor)))] ${
                                      menuItem.isSoldOut ? 'text-neutral-500' : 'text-neutral-300'
                                    }`}
                                  >
                                    <RichText data={menuItem.description} />
                                  </div>
                                )}
                                {menuItem.subItems && menuItem.subItems.length > 0 && (
                                  <div className="mt-[calc(0.375rem*var(--zoom-factor))] [&_>_:not([hidden])~:not([hidden])]:mt-[calc(0.25rem_*_var(--zoom-factor))]">
                                    {menuItem.subItems.map((subItem) => (
                                      <div
                                        key={subItem.id || subItem.name}
                                        className={`flex justify-between items-baseline text-[clamp(calc(0.75rem*var(--zoom-factor)),calc(0.83vw*var(--zoom-factor)),calc(1.125rem*var(--zoom-factor)))]`}
                                      >
                                        <span
                                          className={
                                            menuItem.isSoldOut
                                              ? 'text-neutral-500 font-bold'
                                              : 'text-neutral-200 font-bold'
                                          }
                                        >
                                          {subItem.name}
                                        </span>
                                        <span
                                          className={`font-medium whitespace-nowrap ${menuItem.isSoldOut ? 'text-neutral-600' : 'text-neutral-100'}`}
                                        >
                                          ${(subItem.price / 100).toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </section>
                      </DraggableCategory>
                    ))}
                    <AdditionalDropTarget
                      key={`additional-drop-${columnIndex}`}
                      columnIndex={columnIndex}
                      targetItemIndexInColumn={column.length}
                      moveCategory={moveCategory}
                      isOverallDragActive={isOverallDragActive}
                      label="Drop at end of column"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <FloatingMenu
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        onAddStickyNote={addStickyNote}
      />
    </DndProvider>
  )
}
