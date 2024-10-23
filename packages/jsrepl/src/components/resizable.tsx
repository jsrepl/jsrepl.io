'use client'

import React, { useEffect, useRef } from 'react'
import type { ResizableOptions } from '@interactjs/actions/resize/plugin'
import type { OrBoolean } from '@interactjs/core/types'
import interact from 'interactjs'
import './resizable.css'

export default function Resizable({
  size,
  onSizeUpdate,
  edges,
  margin,
  children,
  className,
}: {
  size: { width: number; height: number }
  onSizeUpdate: (size: { width: number; height: number }) => void
  edges: OrBoolean<ResizableOptions['edges']>
  margin?: number | boolean
  children: React.ReactNode
  className?: string
}) {
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interactable = interact(elRef.current!)
      .resizable({
        edges,
        margin,
        listeners: {
          move(event) {
            Object.assign(event.target.style, {
              width: `${event.rect.width}px`,
              height: `${event.rect.height}px`,
            })
          },
        },
        modifiers: [
          // keep the edges inside the parent
          interact.modifiers.restrictEdges({
            outer: 'main',
          }),

          // minimum size
          interact.modifiers.restrictSize({
            min: { width: 200, height: 100 },
          }),
        ],
      })
      .on('resizestart', (event) => {
        event.target.style.pointerEvents = 'none'
        document.documentElement.classList.add('resizable-active')
      })
      .on('resizeend', (event) => {
        event.target.style.pointerEvents = ''
        document.documentElement.classList.remove('resizable-active')
        onSizeUpdate({ width: event.rect.width, height: event.rect.height })
      })

    return () => {
      interactable.unset()
    }
  }, [edges, onSizeUpdate, margin])

  return (
    <div
      ref={elRef}
      style={{ width: `${size.width}px`, height: `${size.height}px` }}
      className={className}
    >
      {children}
    </div>
  )
}
