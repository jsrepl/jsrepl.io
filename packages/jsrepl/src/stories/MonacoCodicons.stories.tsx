import React from 'react'
import type { Meta } from '@storybook/react'
import * as monaco from 'monaco-editor'

export default {
  component: undefined,
  loaders: [
    async () => {
      if (!document.getElementById('editor-root')) {
        const el = document.body.appendChild(document.createElement('div'))
        el.id = 'editor-root'
        el.style.display = 'none'
        monaco.editor.create(el)
        await new Promise((resolve) => setTimeout(resolve, 0))
      }

      const stylesheet = Array.from(document.styleSheets).find((x) =>
        (x.ownerNode as HTMLStyleElement | null)?.classList.contains('monaco-colors')
      )
      const iconNames = (Array.from(stylesheet?.cssRules ?? []) as CSSStyleRule[])
        .filter((rule) => rule.selectorText?.startsWith('.codicon-'))
        .map((rule) => rule.selectorText.replace(/^\./, '').replace('::before', ''))

      return { iconNames }
    },
  ],
  render: (args, { loaded }) => {
    const iconNames = loaded.iconNames as string[]

    return (
      <>
        <div className="flex flex-wrap gap-4">
          {iconNames.map((icon) => (
            <div key={icon} className="flex flex-col items-center gap-2 border p-1">
              <span className={`codicon ${icon} !text-xl !leading-none`} />
              <span className="text-xs">{icon.replace(/^codicon\-/, '')}</span>
            </div>
          ))}
        </div>
      </>
    )
  },
} as Meta

export const Default = {}
