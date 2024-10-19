import React, { useContext } from 'react'
import type * as esbuild from 'esbuild-wasm'
import { LucideCircleAlert, LucideTriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ReplInfoContext } from '@/context/repl-info-context'
import { ReplStateContext } from '@/context/repl-state-context'

export function ErrorsNotification() {
  const { replInfo } = useContext(ReplInfoContext)!

  return (
    <>
      {replInfo && !replInfo.ok && (
        <div className="absolute bottom-6 left-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon-lg">
                {replInfo.errors.length === 0 && replInfo.warnings.length > 0 ? (
                  <LucideTriangleAlert size={24} className="text-yellow-500" />
                ) : (
                  <LucideCircleAlert size={24} className="text-red-500" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end">
              <div className="flex max-w-[calc(var(--radix-popper-available-width)-2rem)] flex-col gap-1 px-2 py-1 text-sm">
                {replInfo.errors.map((error) => (
                  <div key={error.text} className="flex items-start gap-3">
                    <LucideCircleAlert size={18} className="translate-y-px text-red-500" />
                    {error.location?.file && <Location location={error.location} />}
                    <span className="flex-1">{error.text}</span>
                  </div>
                ))}

                {replInfo.warnings.map((warning) => (
                  <div key={warning.text} className="flex items-start gap-3">
                    <LucideTriangleAlert size={18} className="translate-y-px text-yellow-500" />
                    {warning.location?.file && <Location location={warning.location} />}
                    <span className="flex-1">{warning.text}</span>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </>
  )
}

function Location({ location }: { location: esbuild.Location }) {
  const { setReplState } = useContext(ReplStateContext)!

  return (
    <Button
      variant="link"
      size="none"
      className="leading-5"
      onClick={() => {
        setReplState((state) => ({
          ...state,
          activeModel: `/${location.file}`,
        }))
      }}
    >
      /{location.file}
    </Button>
  )
}
