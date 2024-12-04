import { useCallback, useEffect, useMemo, useRef } from 'react'
import { ReplPayload } from '@jsrepl/shared-types'
import interact from 'interactjs'
import {
  LucideArrowLeft,
  LucideArrowLeftToLine,
  LucideArrowRight,
  LucideArrowRightToLine,
  LucideGripVertical,
  LucideRewind,
  LucideSquare,
} from 'lucide-react'
import * as monaco from 'monaco-editor'
import { Button } from '@/components/ui/button'
import { useContinuousButtonPress } from '@/hooks/useContinuousButtonPress'
import { useMonacoEditor } from '@/hooks/useMonacoEditor'
import { useReplPayloads } from '@/hooks/useReplPayloads'
import { useReplRewindMode } from '@/hooks/useReplRewindMode'
import { useReplStoredState } from '@/hooks/useReplStoredState'

export default function RewindModePanel() {
  const [rewindMode, setRewindMode] = useReplRewindMode()
  const { payloads } = useReplPayloads()
  const [, setReplState] = useReplStoredState()
  const [editorRef] = useMonacoEditor()

  const elRef = useRef<HTMLDivElement>(null)

  const currentPayloadNumber = useMemo(() => {
    const currentIndex = payloads.findIndex((payload) => payload.id === rewindMode.currentPayloadId)
    return currentIndex + 1
  }, [payloads, rewindMode.currentPayloadId])

  const selectPayload = useCallback(
    (payload: ReplPayload | null | undefined) => {
      setRewindMode((prev) => ({ ...prev, currentPayloadId: payload ? payload.id : null }))

      if (!payload) {
        return
      }

      const { filePath, lineStart, lineEnd } = payload.ctx
      setReplState((prev) => ({
        ...prev,
        activeModel: filePath,
        openedModels: prev.openedModels.includes(filePath)
          ? prev.openedModels
          : [...prev.openedModels, filePath],
      }))

      requestAnimationFrame(() => {
        if (!editorRef.current) {
          return
        }

        editorRef.current.revealLinesInCenterIfOutsideViewport(
          lineStart,
          lineEnd,
          monaco.editor.ScrollType.Smooth
        )
      })
    },
    [setRewindMode, editorRef, setReplState]
  )

  const goFirst = useCallback(() => {
    selectPayload(payloads[0])
  }, [payloads, selectPayload])

  const goLast = useCallback(() => {
    selectPayload(payloads[payloads.length - 1])
  }, [payloads, selectPayload])

  const goPrev = useCallback(() => {
    const currentIndex = payloads.findIndex((payload) => payload.id === rewindMode.currentPayloadId)
    const prevPayload = currentIndex > 0 ? payloads[currentIndex - 1] : payloads[0]
    selectPayload(prevPayload)
  }, [payloads, selectPayload, rewindMode.currentPayloadId])

  const goNext = useCallback(() => {
    const currentIndex = payloads.findIndex((payload) => payload.id === rewindMode.currentPayloadId)
    const nextPayload =
      currentIndex !== -1 && currentIndex < payloads.length - 1
        ? payloads[currentIndex + 1]
        : payloads[payloads.length - 1]
    selectPayload(nextPayload)
  }, [payloads, selectPayload, rewindMode.currentPayloadId])

  const goPrevContinuous = useContinuousButtonPress(goPrev, 700, 100)
  const goNextContinuous = useContinuousButtonPress(goNext, 700, 100)

  const stop = useCallback(() => {
    setRewindMode((prev) => {
      if (prev.active) {
        return { ...prev, active: false, currentPayloadId: null }
      } else {
        const lastPayload = payloads[payloads.length - 1]
        return { ...prev, active: true, currentPayloadId: lastPayload ? lastPayload.id : null }
      }
    })
  }, [payloads, setRewindMode])

  useEffect(() => {
    if (!rewindMode.active) {
      return
    }

    const interactable = interact(elRef.current!).draggable({
      listeners: { move: dragMoveListener },
      allowFrom: '[data-drag-handle]',
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: true,
        }),
      ],
    })

    return () => {
      interactable.unset()
    }
  }, [rewindMode.active])

  return (
    rewindMode.active && (
      <div
        ref={elRef}
        className="bg-secondary group absolute left-1/2 top-11 z-[1] flex -translate-x-1/2 touch-none select-none items-center rounded border px-1 py-1 opacity-90 shadow-md"
      >
        <div className="text-muted-foreground/40 grid px-1" data-drag-handle>
          <LucideGripVertical
            height={28}
            width={16}
            className="col-span-full row-span-full hidden group-hover:block"
          />
          <LucideRewind
            height={28}
            width={16}
            className="col-span-full row-span-full group-hover:hidden"
          />
        </div>

        <hr className="border-muted-foreground/20 mx-1 h-5 border-l" />

        <div className="flex items-center">
          <Button variant="ghost" size="icon-xs" onClick={goFirst}>
            <LucideArrowLeftToLine size={16} />
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={goPrev}
            onMouseDown={goPrevContinuous.onMouseDown}
            onMouseUp={goPrevContinuous.onMouseUp}
          >
            <LucideArrowLeft size={16} />
          </Button>

          <span className="text-muted-foreground mx-1 text-xs font-medium tabular-nums">
            {currentPayloadNumber} / {payloads.length}
          </span>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={goNext}
            onMouseDown={goNextContinuous.onMouseDown}
            onMouseUp={goNextContinuous.onMouseUp}
          >
            <LucideArrowRight size={16} />
          </Button>

          <Button variant="ghost" size="icon-xs" onClick={goLast}>
            <LucideArrowRightToLine size={16} />
          </Button>

          <hr className="border-muted-foreground/20 mx-1 h-5 border-l" />

          <Button variant="ghost" size="icon-xs" className="hover:text-red-400" onClick={stop}>
            <LucideSquare size={15} />
          </Button>
        </div>
      </div>
    )
  )
}

function dragMoveListener(event: Interact.DragEvent) {
  const target = event.target as HTMLElement & { _x: number | undefined; _y: number | undefined }
  const x = (target._x ?? 0) + event.dx
  const y = (target._y ?? 0) + event.dy
  target._x = x
  target._y = y
  target.style.translate = `${x}px ${y}px`
}
