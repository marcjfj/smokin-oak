'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import type {
  Media,
  MenuItem as PayloadMenuItem,
  Category as PayloadCategory,
} from '@/payload-types' // Assuming payload-types is accessible
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { goblinOne } from '@/lib/fonts' // Assuming fonts are accessible
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import type { Identifier, XYCoord } from 'dnd-core'
import type { ContactInfoType, HoursType, BusinessHourScheduleItem } from './page' // Import defined types
import FloatingPrintButton from './FloatingPrintButton' // Added import

const PRINT_CATEGORY_LAYOUT_STORAGE_KEY = 'printMenuCategoryLayout'
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || ''
const NUM_COLUMNS = 5 // Expanded to 5 columns (3 front, 2 back content)
const MAX_PANEL_CONTENT_HEIGHT_PX = 1600 // Max content height in pixels for a panel, increased for buffer

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

// Define the structure of a menu item (consistent with digital menu)
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
  order: number // Order of item within its category
  updatedAt: string
  createdAt: string
}

interface GroupedItem {
  items: MenuItem[]
  categoryDetails: EnrichedCategory
}

// Simplified Draggable Category for a single list
interface DraggableCategoryProps {
  id: string // category id
  categoryKey: string // category name used as key
  index: number // index in the column (renamed from itemIndexInColumn for clarity here)
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
  columnIndex: number
  // itemIndexInColumn is essentially 'index' now passed to DraggableCategory
}

const ItemTypes = {
  CATEGORY: 'category',
}

const DraggableCategory: React.FC<DraggableCategoryProps> = ({
  id,
  categoryKey,
  index,
  group,
  moveCategory,
  children,
  isOverallDragActive,
  onDragStart,
  onDragEnd,
  columnIndex,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [{ handlerId }, drop] = useDrop<
    {
      categoryKey: string // Changed from id to categoryKey to match item type
      originalColumnIndex: number
      originalItemIndexInColumn: number
      // type: string // type is implicitly ItemTypes.CATEGORY
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
      // item: { categoryKey: string, originalColumnIndex: number, originalItemIndexInColumn: number }
      if (!ref.current) {
        return
      }
      const dragColumnIndex = item.originalColumnIndex
      const dragItemIndexInColumn = item.originalItemIndexInColumn
      const hoverColumnIndex = columnIndex
      const hoverItemIndexInColumn = index // This is the index of the current item in its column

      // Don't replace items with themselves
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

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards over a different item
      if (
        dragColumnIndex === hoverColumnIndex &&
        dragItemIndexInColumn < hoverItemIndexInColumn &&
        hoverClientY < hoverMiddleY
      ) {
        return
      }

      // Dragging upwards over a different item
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

      // Note: we're mutating the monitor item here!
      // This is generally not recommended, but it continuously updates the item's index as it's dragged.
      item.originalColumnIndex = hoverColumnIndex
      item.originalItemIndexInColumn = hoverItemIndexInColumn
    },
  })

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.CATEGORY,
      item: () => {
        onDragStart() // Callback to set overall drag active state
        return {
          categoryKey,
          originalColumnIndex: columnIndex,
          originalItemIndexInColumn: index,
        }
      },
      end: (_item, monitor) => {
        onDragEnd() // Callback to unset overall drag active state
      },
      collect: (monitor: any) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [categoryKey, columnIndex, index, onDragStart, onDragEnd, moveCategory], // Added dependencies
  )

  const opacity = isDragging ? 0.4 : 1
  drag(drop(ref))

  const isPotentialTarget = isOverallDragActive && !isDragging

  return (
    <div
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className={`mb-4 p-4 border cursor-move no-print-border rounded break-inside-avoid-column ${
        isPotentialTarget
          ? 'border-dashed border-neutral-400' // Style for potential drop target
          : 'border-neutral-300' // Default border
      } ${
        isDragging ? 'bg-neutral-200' : 'bg-white' // Slightly different bg when dragging
      }`}
    >
      {children}
    </div>
  )
}

// EmptyDropTarget component (adapted from InteractiveDigitalMenu)
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
  const emptyTargetRef = useRef<HTMLDivElement>(null)
  const [{ isOver, canDrop }, dropConnector] = useDrop({
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
        0, // Place at the beginning of the target column
      )
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  dropConnector(emptyTargetRef)
  const isActiveDropZone = isOverallDragActive && canDrop

  return (
    <div
      ref={emptyTargetRef}
      className={`w-full flex-grow h-full min-h-[6rem] p-4 border-2 rounded flex items-center justify-center transition-colors duration-150 ${
        isActiveDropZone && isOver
          ? 'border-yellow-500 bg-neutral-200' // Adjusted colors for light theme
          : isActiveDropZone
            ? 'border-dashed border-neutral-400'
            : 'border-dashed border-neutral-300'
      }`}
    >
      <p
        className={`text-sm ${
          isActiveDropZone && isOver ? 'text-yellow-600' : 'text-neutral-500' // Adjusted colors
        }`}
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

// AdditionalDropTarget component (adapted from InteractiveDigitalMenu)
interface AdditionalDropTargetProps {
  columnIndex: number
  targetItemIndexInColumn: number // This is where the item will be inserted
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
    return null
  }

  const isActiveDropZone = canDrop

  return (
    <div
      ref={dropRef}
      className={`w-full min-h-[6rem] p-4 mt-2 border-2 rounded flex items-center justify-center transition-colors duration-150 ${
        isActiveDropZone && isOver
          ? 'border-yellow-500 bg-neutral-200' // Adjusted colors
          : isActiveDropZone
            ? 'border-dashed border-neutral-400'
            : 'border-dashed border-neutral-300 opacity-50'
      }`}
    >
      <p
        className={`text-sm ${
          isActiveDropZone && isOver ? 'text-yellow-600' : 'text-neutral-500' // Adjusted colors
        }`}
      >
        {label}
      </p>
    </div>
  )
}

interface InteractivePrintMenuProps {
  initialMenuItems: MenuItem[]
  contactInfo?: ContactInfoType | null
  businessHours?: HoursType | null
}

export default function InteractivePrintMenu({
  initialMenuItems,
  contactInfo,
  businessHours,
}: InteractivePrintMenuProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems)
  const [columns, setColumns] = useState<Array<Array<[string, GroupedItem]>>>([])
  const [isOverallDragActive, setIsOverallDragActive] = useState(false)
  const panelRefs = useRef<(HTMLDivElement | null)[]>(Array(NUM_COLUMNS).fill(null))
  const [panelOverflow, setPanelOverflow] = useState<boolean[]>(Array(NUM_COLUMNS).fill(false))

  const handleDragStart = useCallback(() => {
    setIsOverallDragActive(true)
  }, [])

  const handleDragEnd = useCallback(() => {
    setIsOverallDragActive(false)
  }, [])

  useEffect(() => {
    setMenuItems(initialMenuItems) // Update if props change
  }, [initialMenuItems])

  useEffect(() => {
    if (menuItems.length === 0) {
      setColumns(Array.from({ length: NUM_COLUMNS }, () => [])) // Initialize empty columns
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

    // Sort items within each category by their predefined order
    for (const key in groupedMenuItems) {
      groupedMenuItems[key].items.sort((a, b) => a.order - b.order)
    }

    // Load layout from local storage
    const storedLayoutString = localStorage.getItem(PRINT_CATEGORY_LAYOUT_STORAGE_KEY)
    const newColumns: Array<Array<[string, GroupedItem]>> = Array.from(
      { length: NUM_COLUMNS },
      () => [],
    )
    const seenCategoryKeys = new Set<string>()

    if (storedLayoutString) {
      try {
        const storedLayout = JSON.parse(storedLayoutString) as string[][] // Expecting array of arrays of keys
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
        console.error('Failed to parse print category layout from local storage', e)
        // Fallback to default distribution if parsing fails, will be handled below
      }
    }

    // Distribute remaining or all categories (if no stored layout or parse failed)
    // First, sort all available categories by their inherent order
    const allCategoryEntriesSorted = Object.entries(groupedMenuItems).sort(
      ([, groupA], [, groupB]) => {
        const orderA = groupA.categoryDetails.order ?? Infinity
        const orderB = groupB.categoryDetails.order ?? Infinity
        return orderA - orderB
      },
    )

    allCategoryEntriesSorted.forEach(([key, group]) => {
      if (!seenCategoryKeys.has(key)) {
        // Find the shortest column to add the new category
        let shortestColumnIndex = 0
        for (let i = 1; i < NUM_COLUMNS; i++) {
          if (newColumns[i].length < newColumns[shortestColumnIndex].length) {
            shortestColumnIndex = i
          }
        }
        newColumns[shortestColumnIndex].push([key, group])
        seenCategoryKeys.add(key) // Mark as added
      }
    })

    setColumns(newColumns)
    // Save the initial or loaded layout (important if new items were auto-distributed)
    const layoutToStore = newColumns.map((col) => col.map(([key]) => key))
    localStorage.setItem(PRINT_CATEGORY_LAYOUT_STORAGE_KEY, JSON.stringify(layoutToStore))
  }, [menuItems])

  useEffect(() => {
    const newOverflowStates = Array(NUM_COLUMNS).fill(false)
    let changed = false

    panelRefs.current.forEach((panelEl, index) => {
      if (panelEl) {
        const currentColumnData = columns[index]
        if (currentColumnData && currentColumnData.length > 0) {
          const contentHeight = panelEl.scrollHeight
          if (contentHeight > MAX_PANEL_CONTENT_HEIGHT_PX) {
            newOverflowStates[index] = true
            console.log(
              `Panel ${index} overflow check: scrollHeight (${contentHeight}px) > MAX_PANEL_CONTENT_HEIGHT_PX (${MAX_PANEL_CONTENT_HEIGHT_PX}px)`,
            )
          }
        }
      }
    })

    for (let i = 0; i < NUM_COLUMNS; i++) {
      if (newOverflowStates[i] !== panelOverflow[i]) {
        changed = true
        break
      }
    }

    if (changed) {
      setPanelOverflow(newOverflowStates)
    }
  }, [columns]) // panelOverflow is intentionally not a dependency here

  const moveCategory = useCallback(
    (
      draggedCategoryKey: string,
      sourceColumnIndex: number,
      sourceItemIndexInColumn: number,
      targetColumnIndex: number,
      targetItemIndexInColumn: number,
    ) => {
      setColumns((prevColumns) => {
        const newColumns = prevColumns.map((col) => [...col]) // Shallow copy of columns

        let draggedItem: [string, GroupedItem] | undefined

        // Find and remove the dragged item from its source column
        if (
          newColumns[sourceColumnIndex] &&
          newColumns[sourceColumnIndex][sourceItemIndexInColumn] &&
          newColumns[sourceColumnIndex][sourceItemIndexInColumn][0] === draggedCategoryKey
        ) {
          ;[draggedItem] = newColumns[sourceColumnIndex].splice(sourceItemIndexInColumn, 1)
        } else {
          // Fallback search if source coordinates are off (should ideally not happen with correct drag item info)
          console.warn(
            `Dragged item ${draggedCategoryKey} not found at expected source (${sourceColumnIndex}, ${sourceItemIndexInColumn}). Searching...`,
          )
          for (let i = 0; i < newColumns.length; i++) {
            const itemIdx = newColumns[i].findIndex(([key]) => key === draggedCategoryKey)
            if (itemIdx !== -1) {
              console.warn(`Found item in column ${i} at index ${itemIdx}.`)
              sourceColumnIndex = i // Correct the source for logging if needed, splice uses corrected i.
              ;[draggedItem] = newColumns[i].splice(itemIdx, 1)
              break
            }
          }
        }

        if (!draggedItem) {
          console.error('Could not find dragged item to move:', draggedCategoryKey)
          return prevColumns // Return original columns if item not found
        }

        // Ensure the target column exists (it should, as newColumns is initialized)
        if (!newColumns[targetColumnIndex]) {
          newColumns[targetColumnIndex] = []
        }

        // Add the dragged item to the target column at the specified index
        newColumns[targetColumnIndex].splice(targetItemIndexInColumn, 0, draggedItem)

        const layoutToStore = newColumns.map((col) => col.map(([key]) => key))
        localStorage.setItem(PRINT_CATEGORY_LAYOUT_STORAGE_KEY, JSON.stringify(layoutToStore))
        return newColumns
      })
    },
    [],
  )

  if (initialMenuItems.length === 0) {
    return (
      <div className="py-8 px-4 text-center text-neutral-700 print:text-black">
        No menu items available at the moment. Please check back later.
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <FloatingPrintButton />
      <div className="print-menu-container p-4 bg-white text-black print:bg-white print:text-black">
        <style jsx global>{`
          /* Screen styles are largely Tailwind based and should remain for interactivity */

          @media print {
            @page {
              size: letter landscape;
              margin: 8mm;
            }

            /* Original body styles restored */
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              width: 100%;
              margin: 0;
              padding: 0;
            }

            .no-print {
              display: none !important;
            }

            .print-menu-container {
              width: 100%;
              max-width: 100%;
              margin: 0 !important;
              padding: 0 !important;
              font-size: 9pt;
              background-color: white !important;
              color: black !important;
            }

            /* Page wrapper divs */
            #print-page-1,
            #print-page-2 {
              display: grid !important; /* Force grid for print */
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 6mm !important;
              width: 100%;
              height: calc(100vh - 16mm); /* Restored original height */
              overflow: hidden; /* Prevent grid from causing overflow issues on page */
            }

            #print-page-2 {
              page-break-before: always;
            }

            /* Common styling for each of the 6 panels in the trifold */
            .print-panel-trifold {
              box-sizing: border-box;
              padding: 4mm;
              border: none !important; /* Ensure print border overrides screen, and is hidden */
              overflow: hidden;
              page-break-inside: avoid !important;
              /* height: 100%; Removed to allow natural grid item stretching */
              background-color: white !important; /* Ensure panel bg is white for print */
            }

            /* Remove specific width/flex from screen column containers for print */
            .print-column-screen-wrapper {
              display: contents; /* Makes this div not affect its children in print grid */
            }
            .print-menu-column-container-wrapper {
              /* This was the flex container for screen */
              display: contents; /* For page 2, let the grid control columns */
            }
            .print-column {
              /* Individual category columns inside #print-page-2 grid cells */
              /* padding: 0 !important; Already handled by print-panel-trifold */
              /* width: 100% !important; /* Let grid cell define width */
              /* height: 100%; /* Let grid cell define height */
              /* break-inside: avoid; Already on print-panel-trifold */
            }

            /* Specific panel styling adjustments */
            .back-cover-panel-print {
              text-align: center;
            }

            /* Vertically center content in the front cover panel (panel 1 on page 1) for print */
            #print-page-1 > .print-panel-trifold:first-child > div {
              justify-content: center; /* This div already has display:flex, flex-direction:column from Tailwind classes */
            }

            /* Hide empty column placeholder's border and message in print */
            .print-panel-trifold .border-dashed {
              border-style: none !important;
              background-color: transparent !important;
            }
            .print-panel-trifold .border-dashed p {
              display: none !important;
            }

            /* Ensure content within panels respects boundaries */
            .print-menu-category section,
            .print-menu-category {
              page-break-inside: avoid !important;
            }
            .print-menu-item {
              page-break-inside: avoid !important;
            }

            /* Override/Remove old print column styles that might conflict */
            .printable-content-front,
            .printable-content-back,
            .printable-content-back-panel {
              column-count: unset !important;
              grid-template-columns: unset !important; /* If previously set */
              gap: unset !important;
              display: block; /* Reset to block, grid is at page level */
              padding: 0 !important; /* Padding is on print-panel-trifold */
              margin: 0 !important; /* Margin is on print-panel-trifold or gap */
            }

            /* Text color & background overrides from previous steps - ensure they are still valid */
            .print-menu-container h2,
            .print-menu-container h3,
            .print-menu-container p,
            .print-menu-container span,
            .print-menu-container div {
              color: black !important;
              background-color: transparent !important; /* Ensure no unwanted bg colors on text elements */
            }
            .print-menu-container .bg-neutral-50,
            .print-menu-container .bg-neutral-100 {
              /* Draggable category item background on screen */
              background-color: #f9f9f9 !important;
            }
            .print-menu-container .border,
            .print-menu-container .border-neutral-300,
            .print-menu-container .border-neutral-600, /* item border */
            .print-menu-container .border-neutral-700 {
              border-color: #ddd !important;
            }
            .no-print-border {
              border: none !important;
            }
          }
        `}</style>

        {/* Screen Sections Titles - REMOVED */}
        {/* <div className="no-print my-8"> ... </div> */}

        {/* Page 1 / Back of Menu Section (Static Info + 2 Category Columns) */}
        {/* Title REMOVED */}
        {/* <div className="no-print mb-12"> ... </div> */}
        <div
          id="print-page-1"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 print:grid print:grid-cols-3"
        >
          {/* Panels 2 & 3 (now 1 & 2): Droppable Category Columns for Back (columns[3] and columns[4]) */}
          {columns.slice(3, 5).map((columnItems, idx) => {
            const columnIndex = idx + 3
            return (
              <div
                key={`back-col-${columnIndex}`}
                ref={(el) => {
                  if (el) panelRefs.current[columnIndex] = el
                }}
                className={`print-panel-trifold bg-white rounded p-4 flex flex-col ${
                  panelOverflow[columnIndex]
                    ? 'border-red-500 border-2'
                    : 'border border-neutral-300'
                }`}
              >
                {/* Panel Title REMOVED */}
                {columnItems.length === 0 ? (
                  <EmptyDropTarget
                    columnIndex={columnIndex}
                    moveCategory={moveCategory}
                    isOverallDragActive={isOverallDragActive}
                  />
                ) : (
                  <>
                    {columnItems.map(([categoryKey, group], itemIndexInColumn) => (
                      <DraggableCategory
                        key={categoryKey}
                        id={group.categoryDetails.id}
                        categoryKey={categoryKey}
                        index={itemIndexInColumn}
                        group={group}
                        moveCategory={moveCategory}
                        isOverallDragActive={isOverallDragActive}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        columnIndex={columnIndex}
                      >
                        <section className="print-menu-category">
                          <h2
                            className={`font-semibold text-neutral-800 mb-2 ${goblinOne.className} text-lg screen-text-lg print:text-base`}
                          >
                            {group.categoryDetails.name}
                          </h2>
                          {group.categoryDetails.description && (
                            <p className="text-neutral-600 mb-3 italic text-base screen-text-base print:text-sm">
                              {group.categoryDetails.description}
                            </p>
                          )}
                          {group.items.map((menuItem) => (
                            <div
                              key={menuItem.id}
                              className="print-menu-item flex items-start py-1.5 border-b border-neutral-600 last:border-b-0 text-sm screen-text-sm print:text-xs"
                            >
                              <div className="flex-grow">
                                <div
                                  className={`flex justify-between items-baseline ${menuItem.description || (menuItem.subItems && menuItem.subItems.length > 0) ? 'mb-0.5' : 'mb-0'}`}
                                >
                                  <div className="flex items-baseline">
                                    <h3
                                      className={`font-semibold mr-1.5 text-base screen-text-base print:text-sm text-black`}
                                      title={menuItem.name}
                                    >
                                      {menuItem.name}
                                    </h3>
                                  </div>
                                  <p
                                    className={`font-medium ml-2 whitespace-nowrap text-base screen-text-base print:text-sm ${menuItem.price !== null && typeof menuItem.price === 'number' ? 'text-black' : 'text-transparent'}`}
                                  >
                                    {menuItem.price !== null && typeof menuItem.price === 'number'
                                      ? `$${(menuItem.price / 100).toFixed(2)}`
                                      : ''}
                                  </p>
                                </div>
                                {menuItem.description && (
                                  <div className="prose max-w-none text-sm screen-text-sm print:text-xs text-neutral-700 [&_p]:my-1! print:[&_p]:my-0!">
                                    <RichText data={menuItem.description} />
                                  </div>
                                )}
                                {menuItem.subItems && menuItem.subItems.length > 0 && (
                                  <div className="mt-0.5 text-xs screen-text-xs print:text-[8pt]">
                                    {menuItem.subItems.map((subItem) => (
                                      <div
                                        key={subItem.id || subItem.name}
                                        className="flex justify-between items-baseline"
                                      >
                                        <span className={`font-bold`}>{subItem.name}</span>
                                        <span className={`font-medium whitespace-nowrap`}>
                                          ${(subItem.price / 100).toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {menuItem.image && SERVER_URL && !menuItem.isSoldOut && (
                                <div className="ml-2 w-12 h-12 relative flex-shrink-0 no-print">
                                  <Image
                                    src={`${SERVER_URL}${menuItem.image.url}`}
                                    alt={menuItem.image.alt}
                                    layout="fill"
                                    objectFit="cover"
                                    className="rounded"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </section>
                      </DraggableCategory>
                    ))}
                    <AdditionalDropTarget
                      columnIndex={columnIndex}
                      targetItemIndexInColumn={columnItems.length}
                      moveCategory={moveCategory}
                      isOverallDragActive={isOverallDragActive}
                      label="Drop at end of column"
                    />
                  </>
                )}
                {panelOverflow[columnIndex] && (
                  <div className="no-print p-2 text-red-700 bg-red-100 border-t-2 border-red-500 mt-auto text-sm font-semibold text-center">
                    Warning: Content may be too tall for print.
                  </div>
                )}
              </div>
            )
          })}

          {/* Panel 1 (now 3): Static Info (Cover) */}
          <div className="print-panel-trifold border border-neutral-300 rounded p-6">
            <div className="flex flex-col items-center text-center h-full">
              <Image
                src="/smokin-oak-logo-light.png"
                alt="Smokin' Oak BBQ Logo"
                width={150}
                height={75}
                className="mb-4 invert"
              />
              {contactInfo && (
                <div className="mb-4 text-sm screen-text-sm print:text-xs">
                  <h3
                    className={`text-lg screen-text-lg print:text-base font-semibold mb-1 ${goblinOne.className}`}
                  >
                    Contact Us
                  </h3>
                  <ul className="space-y-0.5">
                    {contactInfo.email && (
                      <li>
                        <a href={`mailto:${contactInfo.email}`} className="hover:text-neutral-700">
                          {contactInfo.email}
                        </a>
                      </li>
                    )}
                    {contactInfo.phone && <li>{contactInfo.phone}</li>}
                    {contactInfo.address && (
                      <li>
                        {contactInfo.address.street}, {contactInfo.address.city},{' '}
                        {contactInfo.address.state} {contactInfo.address.zipCode}
                      </li>
                    )}
                  </ul>
                </div>
              )}
              {businessHours && businessHours.schedule && businessHours.schedule.length > 0 && (
                <div className="text-sm screen-text-sm print:text-xs">
                  <h3
                    className={`text-lg screen-text-lg print:text-base font-semibold mb-1 ${goblinOne.className}`}
                  >
                    Hours
                  </h3>
                  <ul className="space-y-0.5 min-w-[180px]">
                    {businessHours.schedule.map((item: BusinessHourScheduleItem) => (
                      <li key={item.id || item.day} className="flex justify-between">
                        <span className="capitalize font-medium mr-2">{item.day}</span>
                        <span>{item.timeRange}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page 2 / Front of Menu Section (3 Main Category Columns) */}
        {/* Title REMOVED */}
        {/* <div className="no-print my-8 pt-8 border-t-2 border-dashed border-neutral-400"> ... </div> */}
        <div
          id="print-page-2"
          className="flex flex-col lg:flex-row gap-6 print:grid print:grid-cols-3"
        >
          {columns.slice(0, 3).map((columnItems, columnIndex) => (
            <div
              key={`front-col-${columnIndex}`}
              ref={(el) => {
                if (el) panelRefs.current[columnIndex] = el
              }}
              className={`print-panel-trifold bg-white rounded p-4 flex flex-col flex-1 lg:w-1/3 ${
                panelOverflow[columnIndex] ? 'border-red-500 border-2' : 'border border-neutral-300'
              }`}
            >
              {/* Panel Title REMOVED */}
              {columnItems.length === 0 ? (
                <EmptyDropTarget
                  columnIndex={columnIndex}
                  moveCategory={moveCategory}
                  isOverallDragActive={isOverallDragActive}
                />
              ) : (
                <>
                  {columnItems.map(([categoryKey, group], itemIndexInColumn) => (
                    <DraggableCategory
                      key={categoryKey}
                      id={group.categoryDetails.id}
                      categoryKey={categoryKey}
                      index={itemIndexInColumn}
                      group={group}
                      moveCategory={moveCategory}
                      isOverallDragActive={isOverallDragActive}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      columnIndex={columnIndex}
                    >
                      <section className="print-menu-category">
                        <h2
                          className={`font-semibold text-neutral-800 ${goblinOne.className} text-lg screen-text-lg print:text-base`}
                        >
                          {group.categoryDetails.name}
                        </h2>
                        {group.categoryDetails.description && (
                          <p className="text-neutral-600italic text-base screen-text-base print:text-sm">
                            {group.categoryDetails.description}
                          </p>
                        )}
                        {group.items.map((menuItem) => (
                          <div
                            key={menuItem.id}
                            className="print-menu-item flex items-start py-1.5 border-b border-neutral-600 last:border-b-0 text-sm screen-text-sm print:text-xs"
                          >
                            <div className="flex-grow">
                              <div
                                className={`flex justify-between items-baseline ${menuItem.description || (menuItem.subItems && menuItem.subItems.length > 0) ? 'mb-0.5' : 'mb-0'}`}
                              >
                                <div className="flex items-baseline">
                                  <h3
                                    className={`font-semibold mr-1.5 text-base screen-text-base print:text-sm text-black`}
                                    title={menuItem.name}
                                  >
                                    {menuItem.name}
                                  </h3>
                                </div>
                                <p
                                  className={`font-medium ml-2 whitespace-nowrap text-base screen-text-base print:text-sm ${menuItem.price !== null && typeof menuItem.price === 'number' ? 'text-black' : 'text-transparent'}`}
                                >
                                  {menuItem.price !== null && typeof menuItem.price === 'number'
                                    ? `$${(menuItem.price / 100).toFixed(2)}`
                                    : ''}
                                </p>
                              </div>
                              {menuItem.description && (
                                <div className="prose max-w-none text-sm screen-text-sm print:text-xs text-neutral-700 [&_p]:my-1! print:[&_p]:my-0!">
                                  <RichText data={menuItem.description} />
                                </div>
                              )}
                              {menuItem.subItems && menuItem.subItems.length > 0 && (
                                <div className="mt-0.5 text-xs screen-text-xs print:text-[8pt]">
                                  {menuItem.subItems.map((subItem) => (
                                    <div
                                      key={subItem.id || subItem.name}
                                      className="flex justify-between items-baseline"
                                    >
                                      <span className={`font-bold`}>{subItem.name}</span>
                                      <span className={`font-medium whitespace-nowrap`}>
                                        ${(subItem.price / 100).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            {menuItem.image && SERVER_URL && !menuItem.isSoldOut && (
                              <div className="ml-2 w-12 h-12 relative flex-shrink-0 no-print">
                                <Image
                                  src={`${SERVER_URL}${menuItem.image.url}`}
                                  alt={menuItem.image.alt}
                                  layout="fill"
                                  objectFit="cover"
                                  className="rounded"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </section>
                    </DraggableCategory>
                  ))}
                  <AdditionalDropTarget
                    columnIndex={columnIndex}
                    targetItemIndexInColumn={columnItems.length}
                    moveCategory={moveCategory}
                    isOverallDragActive={isOverallDragActive}
                    label="Drop at end of column"
                  />
                </>
              )}
              {panelOverflow[columnIndex] && (
                <div className="no-print p-2 text-red-700 bg-red-100 border-t-2 border-red-500 mt-auto text-sm font-semibold text-center">
                  Warning: Content may be too tall for print.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DndProvider>
  )
}
