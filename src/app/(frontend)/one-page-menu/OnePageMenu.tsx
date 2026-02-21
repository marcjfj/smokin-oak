'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import type {
  Media,
  MenuItem as PayloadMenuItem,
  Category as PayloadCategory,
} from '@/payload-types'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { goblinOne } from '@/lib/fonts'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import type { Identifier, XYCoord } from 'dnd-core'
import type { ContactInfoType } from './page'
import FloatingPrintButton from './FloatingPrintButton'

const LAYOUT_STORAGE_KEY = 'onePageMenuCategoryLayout'
const SHOW_DESCRIPTIONS_KEY = 'onePageMenuShowDescriptions'
const CONFIG_STORAGE_KEY = 'onePageMenuConfig'

type Orientation = 'portrait' | 'landscape'
type ColumnCount = 2 | 3 | 4
type FontSize = 7 | 8 | 9 | 10

interface MenuConfig {
  orientation: Orientation
  numColumns: ColumnCount
  fontSize: FontSize
  marginH: number // mm, horizontal padding inside categories
  marginV: number // mm, vertical gap between categories
  logoHeight: number
  headerPadding: number // mm, padding below header
}

const DEFAULT_CONFIG: MenuConfig = {
  orientation: 'portrait',
  numColumns: 3,
  fontSize: 7,
  marginH: 1,
  marginV: 1,
  logoHeight: 40,
  headerPadding: 2,
}

function loadConfig(): MenuConfig {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_CONFIG, ...parsed }
    }
  } catch {}
  return { ...DEFAULT_CONFIG }
}

function saveConfig(config: MenuConfig) {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config))
}

interface PopulatedImage extends Omit<Media, 'id'> {
  id: string
  url: string
  alt: string
}

interface EnrichedCategory {
  id: string
  name: string
  description?: string | null
  order: number
}

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

// Extract plain text from Lexical SerializedEditorState
function extractPlainText(editorState: SerializedEditorState): string {
  if (!editorState || !editorState.root || !editorState.root.children) return ''

  function walkNodes(nodes: any[]): string {
    return nodes
      .map((node) => {
        if (node.type === 'text' && typeof node.text === 'string') {
          return node.text
        }
        if (node.children && Array.isArray(node.children)) {
          return walkNodes(node.children)
        }
        if (node.type === 'linebreak') {
          return ' '
        }
        return ''
      })
      .join('')
  }

  return walkNodes(editorState.root.children).trim()
}

// Drag-and-drop item type
const ItemTypes = { CATEGORY: 'category' }

interface DraggableCategoryProps {
  id: string
  categoryKey: string
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
  columnIndex: number
  marginV: number
  marginH: number
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
  marginV,
  marginH,
}) => {
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
      return { handlerId: monitor.getHandlerId() }
    },
    hover(item, monitor) {
      if (!ref.current) return
      const dragColumnIndex = item.originalColumnIndex
      const dragItemIndexInColumn = item.originalItemIndexInColumn
      const hoverColumnIndex = columnIndex
      const hoverItemIndexInColumn = index

      if (
        dragColumnIndex === hoverColumnIndex &&
        dragItemIndexInColumn === hoverItemIndexInColumn
      )
        return

      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      if (
        dragColumnIndex === hoverColumnIndex &&
        dragItemIndexInColumn < hoverItemIndexInColumn &&
        hoverClientY < hoverMiddleY
      )
        return

      if (
        dragColumnIndex === hoverColumnIndex &&
        dragItemIndexInColumn > hoverItemIndexInColumn &&
        hoverClientY > hoverMiddleY
      )
        return

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
          originalItemIndexInColumn: index,
        }
      },
      end: () => {
        onDragEnd()
      },
      collect: (monitor: any) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [categoryKey, columnIndex, index, onDragStart, onDragEnd, moveCategory],
  )

  const opacity = isDragging ? 0.4 : 1
  drag(drop(ref))

  const isPotentialTarget = isOverallDragActive && !isDragging

  return (
    <div
      ref={ref}
      style={{ opacity, marginBottom: `${marginV}mm`, padding: `0.5mm ${marginH}mm` }}
      data-handler-id={handlerId}
      className={`border cursor-move no-print-border rounded break-inside-avoid-column ${
        isPotentialTarget ? 'border-dashed border-neutral-400' : 'border-neutral-300'
      } ${isDragging ? 'bg-neutral-200' : 'bg-white'}`}
    >
      {children}
    </div>
  )
}

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
        0,
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
      className={`w-full flex-grow h-full min-h-[4rem] p-2 border-2 rounded flex items-center justify-center transition-colors duration-150 ${
        isActiveDropZone && isOver
          ? 'border-yellow-500 bg-neutral-200'
          : isActiveDropZone
            ? 'border-dashed border-neutral-400'
            : 'border-dashed border-neutral-300'
      }`}
    >
      <p
        className={`text-xs ${
          isActiveDropZone && isOver ? 'text-yellow-600' : 'text-neutral-500'
        }`}
      >
        {isActiveDropZone && isOver
          ? 'Drop Here'
          : isActiveDropZone
            ? 'Move here'
            : 'Empty Column'}
      </p>
    </div>
  )
}

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

  if (!isOverallDragActive) return null

  const isActiveDropZone = canDrop

  return (
    <div
      ref={dropRef}
      className={`w-full min-h-[3rem] p-2 mt-1 border-2 rounded flex items-center justify-center transition-colors duration-150 ${
        isActiveDropZone && isOver
          ? 'border-yellow-500 bg-neutral-200'
          : isActiveDropZone
            ? 'border-dashed border-neutral-400'
            : 'border-dashed border-neutral-300 opacity-50'
      }`}
    >
      <p
        className={`text-xs ${
          isActiveDropZone && isOver ? 'text-yellow-600' : 'text-neutral-500'
        }`}
      >
        {label}
      </p>
    </div>
  )
}

// --- Sidebar sub-components ---

function SegmentedToggle<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex rounded-md border border-neutral-300 overflow-hidden">
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={`flex-1 px-2 py-1.5 text-xs font-medium transition-colors ${
              value === opt.value
                ? 'bg-neutral-800 text-white'
                : 'bg-white text-neutral-600 hover:bg-neutral-100'
            } ${options.indexOf(opt) > 0 ? 'border-l border-neutral-300' : ''}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

interface OnePageMenuProps {
  initialMenuItems: MenuItem[]
  contactInfo?: ContactInfoType | null
}

export default function OnePageMenu({
  initialMenuItems,
  contactInfo,
}: OnePageMenuProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems)
  const [columns, setColumns] = useState<Array<Array<[string, GroupedItem]>>>([])
  const [isOverallDragActive, setIsOverallDragActive] = useState(false)
  const [showDescriptions, setShowDescriptions] = useState(true)

  // Configuration state
  const [orientation, setOrientation] = useState<Orientation>(DEFAULT_CONFIG.orientation)
  const [numColumns, setNumColumns] = useState<ColumnCount>(DEFAULT_CONFIG.numColumns)
  const [fontSize, setFontSize] = useState<FontSize>(DEFAULT_CONFIG.fontSize)
  const [marginH, setMarginH] = useState<number>(DEFAULT_CONFIG.marginH)
  const [marginV, setMarginV] = useState<number>(DEFAULT_CONFIG.marginV)
  const [logoHeight, setLogoHeight] = useState<number>(DEFAULT_CONFIG.logoHeight)
  const [headerPadding, setHeaderPadding] = useState<number>(DEFAULT_CONFIG.headerPadding)

  const panelRefs = useRef<(HTMLDivElement | null)[]>(Array(numColumns).fill(null))
  const [panelOverflow, setPanelOverflow] = useState<boolean[]>(Array(numColumns).fill(false))

  const handleDragStart = useCallback(() => setIsOverallDragActive(true), [])
  const handleDragEnd = useCallback(() => setIsOverallDragActive(false), [])

  // Load config and show descriptions preference on mount
  useEffect(() => {
    const config = loadConfig()
    setOrientation(config.orientation)
    setNumColumns(config.numColumns)
    setFontSize(config.fontSize)
    setMarginH(config.marginH)
    setMarginV(config.marginV)
    setLogoHeight(config.logoHeight)
    setHeaderPadding(config.headerPadding)

    const stored = localStorage.getItem(SHOW_DESCRIPTIONS_KEY)
    if (stored !== null) {
      setShowDescriptions(stored === 'true')
    }
  }, [])

  // Keep panelRefs and panelOverflow arrays sized to numColumns
  useEffect(() => {
    panelRefs.current = Array(numColumns).fill(null)
    setPanelOverflow(Array(numColumns).fill(false))
  }, [numColumns])

  // Save config whenever it changes (skip initial render)
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    saveConfig({ orientation, numColumns, fontSize, marginH, marginV, logoHeight, headerPadding })
  }, [orientation, numColumns, fontSize, marginH, marginV, logoHeight, headerPadding])

  useEffect(() => {
    setMenuItems(initialMenuItems)
  }, [initialMenuItems])

  useEffect(() => {
    if (menuItems.length === 0) {
      setColumns(Array.from({ length: numColumns }, () => []))
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

    for (const key in groupedMenuItems) {
      groupedMenuItems[key].items.sort((a, b) => a.order - b.order)
    }

    const storedLayoutString = localStorage.getItem(LAYOUT_STORAGE_KEY)
    const newColumns: Array<Array<[string, GroupedItem]>> = Array.from(
      { length: numColumns },
      () => [],
    )
    const seenCategoryKeys = new Set<string>()

    if (storedLayoutString) {
      try {
        const storedLayout = JSON.parse(storedLayoutString) as string[][]
        // Only use stored layout if it matches current column count
        if (storedLayout.length === numColumns) {
          storedLayout.forEach((columnKeys, colIndex) => {
            columnKeys.forEach((key) => {
              if (groupedMenuItems[key]) {
                newColumns[colIndex].push([key, groupedMenuItems[key]])
                seenCategoryKeys.add(key)
              }
            })
          })
        }
      } catch (e) {
        console.error('Failed to parse one-page-menu category layout from local storage', e)
      }
    }

    const allCategoryEntriesSorted = Object.entries(groupedMenuItems).sort(
      ([, groupA], [, groupB]) => {
        const orderA = groupA.categoryDetails.order ?? Infinity
        const orderB = groupB.categoryDetails.order ?? Infinity
        return orderA - orderB
      },
    )

    allCategoryEntriesSorted.forEach(([key, group]) => {
      if (!seenCategoryKeys.has(key)) {
        let shortestColumnIndex = 0
        for (let i = 1; i < numColumns; i++) {
          if (newColumns[i].length < newColumns[shortestColumnIndex].length) {
            shortestColumnIndex = i
          }
        }
        newColumns[shortestColumnIndex].push([key, group])
        seenCategoryKeys.add(key)
      }
    })

    setColumns(newColumns)
    const layoutToStore = newColumns.map((col) => col.map(([key]) => key))
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layoutToStore))
  }, [menuItems, numColumns])

  // Overflow detection — compare each column's scrollHeight to its clientHeight.
  // The columns grid has flex:1 + min-height:0, so each column's rendered height
  // reflects the actual available space. If scrollHeight > clientHeight, it overflows.
  useEffect(() => {
    const newOverflowStates = Array(numColumns).fill(false)
    let changed = false

    panelRefs.current.forEach((panelEl, index) => {
      if (panelEl) {
        const currentColumnData = columns[index]
        if (currentColumnData && currentColumnData.length > 0) {
          if (panelEl.scrollHeight > panelEl.clientHeight + 2) {
            newOverflowStates[index] = true
          }
        }
      }
    })

    for (let i = 0; i < numColumns; i++) {
      if (newOverflowStates[i] !== panelOverflow[i]) {
        changed = true
        break
      }
    }

    if (changed) {
      setPanelOverflow(newOverflowStates)
    }
  }, [columns, showDescriptions, orientation, marginH, marginV, numColumns, fontSize, logoHeight, headerPadding])

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
          for (let i = 0; i < newColumns.length; i++) {
            const itemIdx = newColumns[i].findIndex(([key]) => key === draggedCategoryKey)
            if (itemIdx !== -1) {
              ;[draggedItem] = newColumns[i].splice(itemIdx, 1)
              break
            }
          }
        }

        if (!draggedItem) {
          return prevColumns
        }

        if (!newColumns[targetColumnIndex]) {
          newColumns[targetColumnIndex] = []
        }

        newColumns[targetColumnIndex].splice(targetItemIndexInColumn, 0, draggedItem)

        const layoutToStore = newColumns.map((col) => col.map(([key]) => key))
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layoutToStore))
        return newColumns
      })
    },
    [],
  )

  const handleToggleDescriptions = () => {
    const newValue = !showDescriptions
    setShowDescriptions(newValue)
    localStorage.setItem(SHOW_DESCRIPTIONS_KEY, String(newValue))
  }

  const handleColumnCountChange = (newCount: ColumnCount) => {
    if (newCount !== numColumns) {
      localStorage.removeItem(LAYOUT_STORAGE_KEY)
      setNumColumns(newCount)
    }
  }

  const handleResetLayout = () => {
    localStorage.removeItem(LAYOUT_STORAGE_KEY)
    setColumns([])
    setTimeout(() => setMenuItems([...menuItems]), 0)
  }

  if (initialMenuItems.length === 0) {
    return (
      <div className="py-8 px-4 text-center text-neutral-700">
        No menu items available at the moment. Please check back later.
      </div>
    )
  }

  const pageAspect = orientation === 'portrait' ? '8.5/11' : '11/8.5'
  const pageMaxWidth = orientation === 'portrait' ? '800px' : '1100px'
  const printPageHeightMM = orientation === 'portrait' ? 279.4 : 215.9
  const printUsableHeightMM = printPageHeightMM - 12 // 6mm margins top + bottom

  return (
    <DndProvider backend={HTML5Backend}>
      <FloatingPrintButton />
      <style jsx global>{`
        @media print {
          @page {
            size: letter ${orientation};
            margin: 6mm;
          }

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

          .one-page-menu-outer {
            display: block !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
            height: auto !important;
          }

          .page-preview-area {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            height: auto !important;
            width: 100% !important;
          }

          .page-preview {
            aspect-ratio: unset !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            width: 100% !important;
            height: auto !important;
          }

          .one-page-menu-container {
            display: flex !important;
            flex-direction: column !important;
            width: 100%;
            max-width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            min-height: ${printUsableHeightMM}mm !important;
            height: auto !important;
            font-size: ${fontSize}pt;
            background-color: white !important;
            color: black !important;
          }

          .one-page-header {
            flex-shrink: 0 !important;
            padding: 1mm 0 !important;
            margin-bottom: ${headerPadding}mm !important;
            gap: 2mm !important;
          }

          .one-page-header img {
            height: ${logoHeight}px !important;
            width: auto !important;
          }

          .one-page-header span {
            font-size: ${fontSize}pt !important;
          }

          .one-page-columns {
            display: grid !important;
            grid-template-columns: repeat(${numColumns}, 1fr) !important;
            grid-template-rows: 1fr !important;
            flex: 1 !important;
            min-height: 0 !important;
            gap: 3mm !important;
            width: 100%;
          }

          .one-page-column {
            box-sizing: border-box;
            padding: 0 !important;
            border: none !important;
            overflow: hidden;
            page-break-inside: avoid !important;
          }

          .one-page-category {
            margin-bottom: 1mm !important;
            padding: 0.5mm !important;
            border: none !important;
          }

          .one-page-category-title {
            font-size: ${fontSize + 3}pt !important;
            margin-bottom: 0.5mm !important;
            padding-bottom: 0.3mm !important;
          }

          .one-page-category-desc {
            font-size: ${fontSize}pt !important;
            margin-bottom: 0.5mm !important;
          }

          .one-page-item {
            padding-top: 0.3mm !important;
            padding-bottom: 0.3mm !important;
            border-bottom-width: 0.5px !important;
          }

          .one-page-item-name {
            font-size: ${fontSize + 1}pt !important;
          }

          .one-page-item-price {
            font-size: ${fontSize + 1}pt !important;
          }

          .one-page-item-description {
            font-size: ${fontSize}pt !important;
            line-height: 1.1 !important;
          }

          .one-page-subitem {
            font-size: ${fontSize}pt !important;
          }

          .no-print-border {
            border: none !important;
            margin-bottom: ${marginV}mm !important;
            padding: 0.5mm ${marginH}mm !important;
          }

          /* Hide empty column placeholders in print */
          .one-page-column .border-dashed {
            border-style: none !important;
            background-color: transparent !important;
          }
          .one-page-column .border-dashed p {
            display: none !important;
          }

          /* Ensure text is black */
          .one-page-menu-container h2,
          .one-page-menu-container h3,
          .one-page-menu-container p,
          .one-page-menu-container span,
          .one-page-menu-container div {
            color: black !important;
            background-color: transparent !important;
          }
        }
      `}</style>

      <div className="one-page-menu-outer flex h-screen bg-neutral-100">
        {/* Sidebar — fixed to viewport */}
        <aside className="no-print w-56 flex-shrink-0 h-screen bg-white border-r border-neutral-200 p-4 flex flex-col gap-4 overflow-y-auto">
          <h2 className="text-sm font-semibold text-neutral-800 tracking-tight">
            Menu Settings
          </h2>

          <SegmentedToggle<Orientation>
            label="Orientation"
            value={orientation}
            onChange={setOrientation}
            options={[
              { value: 'portrait', label: 'Portrait' },
              { value: 'landscape', label: 'Landscape' },
            ]}
          />

          <SegmentedToggle<ColumnCount>
            label="Columns"
            value={numColumns}
            onChange={handleColumnCountChange}
            options={[
              { value: 2, label: '2' },
              { value: 3, label: '3' },
              { value: 4, label: '4' },
            ]}
          />

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Font Size
            </span>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value) as FontSize)}
              className="w-full px-2 py-1.5 text-xs border border-neutral-300 rounded-md bg-white text-neutral-700"
            >
              <option value={7}>7pt</option>
              <option value={8}>8pt</option>
              <option value={9}>9pt</option>
              <option value={10}>10pt</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Category H Padding
            </span>
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={marginH}
              onChange={(e) => setMarginH(Number(e.target.value))}
              className="w-full accent-neutral-800"
            />
            <span className="text-[10px] text-neutral-400 text-center">{marginH}mm</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Category V Spacing
            </span>
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={marginV}
              onChange={(e) => setMarginV(Number(e.target.value))}
              className="w-full accent-neutral-800"
            />
            <span className="text-[10px] text-neutral-400 text-center">{marginV}mm</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Header Padding
            </span>
            <input
              type="range"
              min={0}
              max={10}
              value={headerPadding}
              onChange={(e) => setHeaderPadding(Number(e.target.value))}
              className="w-full accent-neutral-800"
            />
            <span className="text-[10px] text-neutral-400 text-center">{headerPadding}mm</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Logo Size
            </span>
            <input
              type="range"
              min={40}
              max={120}
              value={logoHeight}
              onChange={(e) => setLogoHeight(Number(e.target.value))}
              className="w-full accent-neutral-800"
            />
            <span className="text-[10px] text-neutral-400 text-center">{logoHeight}px</span>
          </div>

          <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showDescriptions}
              onChange={handleToggleDescriptions}
              className="rounded border-neutral-300"
            />
            Show descriptions
          </label>

          <div className="mt-auto pt-4 border-t border-neutral-200">
            <button
              onClick={handleResetLayout}
              className="w-full px-3 py-1.5 text-xs font-medium text-neutral-600 border border-neutral-300 rounded-md hover:bg-neutral-100 transition-colors"
            >
              Reset Layout
            </button>
          </div>
        </aside>

        {/* Main content area */}
        <main className="page-preview-area flex-1 overflow-y-auto flex items-start justify-center py-6 px-4">
          {/* Page Preview Container */}
          <div
            className="page-preview bg-white border border-neutral-300 shadow-lg"
            style={{
              aspectRatio: pageAspect,
              maxWidth: pageMaxWidth,
              width: '100%',
              padding: '6mm',
              overflow: 'hidden',
            }}
          >
            <div
              className="one-page-menu-container text-black"
              style={{
                fontSize: `${fontSize}pt`,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              {/* Header — logo left, contact right */}
              <div
                className="one-page-header flex items-center justify-between border-b border-neutral-300"
                style={{ flexShrink: 0, padding: '1mm 0', marginBottom: `${headerPadding}mm` }}
              >
                <img
                  src="/smokin-oak-logo-light.png"
                  alt="Smokin' Oak BBQ"
                  className="invert"
                  style={{ height: `${logoHeight}px` }}
                />
                <div
                  className="flex items-center text-neutral-700"
                  style={{ gap: '2mm', fontSize: `${fontSize}pt` }}
                >
                  {contactInfo?.phone && <span>{contactInfo.phone}</span>}
                  {contactInfo?.phone && contactInfo?.address && (
                    <span className="text-neutral-400">|</span>
                  )}
                  {contactInfo?.address && (
                    <span>
                      {contactInfo.address.street}, {contactInfo.address.city},{' '}
                      {contactInfo.address.state} {contactInfo.address.zipCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Column Grid — fills available space between header & footer */}
              <div
                className="one-page-columns"
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
                  gridTemplateRows: '1fr',
                  gap: '3mm',
                  alignContent: 'start',
                }}
              >
                {columns.map((columnItems, columnIndex) => (
                  <div
                    key={`col-${columnIndex}`}
                    ref={(el) => {
                      if (el) panelRefs.current[columnIndex] = el
                    }}
                    className={`one-page-column bg-white rounded flex flex-col ${
                      panelOverflow[columnIndex]
                        ? 'border-red-500 border-2'
                        : 'border border-neutral-300'
                    }`}
                  >
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
                            marginV={marginV}
                            marginH={marginH}
                          >
                            <section
                              className="one-page-category"
                              style={{ marginBottom: '1mm', padding: '0.5mm' }}
                            >
                              <h2
                                className={`one-page-category-title font-semibold text-neutral-800 border-b border-neutral-400 ${goblinOne.className}`}
                                style={{
                                  fontSize: `${fontSize + 3}pt`,
                                  marginBottom: '0.5mm',
                                  paddingBottom: '0.3mm',
                                }}
                              >
                                {group.categoryDetails.name}
                              </h2>
                              {group.categoryDetails.description && (
                                <p
                                  className="one-page-category-desc text-neutral-600 italic"
                                  style={{ fontSize: `${fontSize}pt`, marginBottom: '0.5mm' }}
                                >
                                  {group.categoryDetails.description}
                                </p>
                              )}
                              {group.items.map((menuItem) => {
                                const plainDescription = menuItem.description
                                  ? extractPlainText(menuItem.description)
                                  : ''

                                return (
                                  <div
                                    key={menuItem.id}
                                    className="one-page-item border-b border-neutral-200 last:border-b-0"
                                    style={{
                                      paddingTop: '0.3mm',
                                      paddingBottom: '0.3mm',
                                    }}
                                  >
                                    <div className="flex justify-between items-baseline">
                                      <h3
                                        className="one-page-item-name font-semibold text-black leading-tight"
                                        style={{ fontSize: `${fontSize + 1}pt` }}
                                      >
                                        {menuItem.name}
                                      </h3>
                                      {menuItem.price !== null &&
                                        typeof menuItem.price === 'number' && (
                                          <span
                                            className="one-page-item-price font-medium text-black whitespace-nowrap ml-1"
                                            style={{ fontSize: `${fontSize + 1}pt` }}
                                          >
                                            ${(menuItem.price / 100).toFixed(2)}
                                          </span>
                                        )}
                                    </div>
                                    {showDescriptions && plainDescription && (
                                      <p
                                        className="one-page-item-description text-neutral-600"
                                        style={{
                                          fontSize: `${fontSize}pt`,
                                          lineHeight: 1.1,
                                          marginTop: '0.3mm',
                                        }}
                                      >
                                        {plainDescription}
                                      </p>
                                    )}
                                    {menuItem.subItems && menuItem.subItems.length > 0 && (
                                      <div style={{ marginTop: '0.3mm' }}>
                                        {menuItem.subItems.map((subItem) => (
                                          <div
                                            key={subItem.id || subItem.name}
                                            className="one-page-subitem flex justify-between items-baseline"
                                            style={{ fontSize: `${fontSize}pt` }}
                                          >
                                            <span className="font-bold">{subItem.name}</span>
                                            <span className="font-medium whitespace-nowrap">
                                              ${(subItem.price / 100).toFixed(2)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </section>
                          </DraggableCategory>
                        ))}
                        <AdditionalDropTarget
                          columnIndex={columnIndex}
                          targetItemIndexInColumn={columnItems.length}
                          moveCategory={moveCategory}
                          isOverallDragActive={isOverallDragActive}
                          label="Drop at end"
                        />
                      </>
                    )}
                    {panelOverflow[columnIndex] && (
                      <div className="no-print p-1 text-red-700 bg-red-100 border-t-2 border-red-500 mt-auto text-xs font-semibold text-center">
                        Warning: Content may overflow print area.
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          </div>
        </main>
      </div>
    </DndProvider>
  )
}
