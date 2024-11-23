import { useContext } from 'react'
import { useTheme } from 'next-themes'
import { CopilotModel, CopilotProvider } from '@nag5000/monacopilot'
import { DialogDescription, DialogProps } from '@radix-ui/react-dialog'
import { LucideUndo2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserStateContext } from '@/context/user-state-context'
import { Themes, defaultThemeId } from '@/lib/themes'
import {
  copilotModelOptionsByProvider,
  copilotProviderOptions,
  getDefaultState,
  lineNumbersOptions,
  previewPositionOptions,
  renderLineHighlightOptions,
} from '@/lib/user-stored-state'
import { LineNumbers, PreviewPosition, RenderLineHighlight } from '@/types'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

const defaultUserState = getDefaultState()

export default function ReplSettingsDialog(props?: DialogProps) {
  const { userState, setUserState } = useContext(UserStateContext)!
  const { resolvedTheme: themeId, setTheme } = useTheme()

  return (
    <Dialog {...props}>
      <DialogContent className="max-h-[90vh] max-w-3xl grid-rows-[auto_1fr]">
        <DialogHeader>
          <DialogTitle className="text-foreground/80">Settings</DialogTitle>
          <DialogDescription className="sr-only">Customize REPL settings</DialogDescription>
        </DialogHeader>
        <div className="-mx-6 -mb-6 overflow-y-auto">
          <div className="space-y-4 pb-6">
            <Row
              title="Workbench: Theme"
              description="Choose a theme"
              isChanged={themeId !== defaultThemeId}
              reset={() => setTheme(defaultThemeId)}
            >
              <Select value={themeId} onValueChange={(value) => setTheme(value)}>
                <SelectTrigger variantSize="sm">
                  <SelectValue placeholder="Select theme..." />
                </SelectTrigger>
                <SelectContent>
                  {Themes.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>

            <Row
              title="Editor: Font Size"
              description="Font size in pixels"
              isChanged={userState.editor.fontSize !== defaultUserState.editor.fontSize}
              reset={() =>
                setUserState((userState) => ({
                  ...userState,
                  editor: {
                    ...defaultUserState.editor,
                    fontSize: defaultUserState.editor.fontSize,
                  },
                }))
              }
            >
              <Input
                variantSize="sm"
                type="number"
                value={userState.editor.fontSize}
                min={8}
                max={32}
                className="min-w-20"
                onChange={(e) =>
                  setUserState((userState) => ({
                    ...userState,
                    editor: { ...userState.editor, fontSize: e.target.valueAsNumber },
                  }))
                }
              />
            </Row>

            <Row
              title="Editor: Line Highlight"
              description="Rendering of current line highlight"
              isChanged={
                userState.editor.renderLineHighlight !== defaultUserState.editor.renderLineHighlight
              }
              reset={() =>
                setUserState((userState) => ({
                  ...userState,
                  editor: {
                    ...defaultUserState.editor,
                    renderLineHighlight: defaultUserState.editor.renderLineHighlight,
                  },
                }))
              }
            >
              <Select
                value={userState.editor.renderLineHighlight}
                onValueChange={(value) =>
                  setUserState((userState) => ({
                    ...userState,
                    editor: {
                      ...userState.editor,
                      renderLineHighlight: value as RenderLineHighlight,
                    },
                  }))
                }
              >
                <SelectTrigger variantSize="sm">
                  <SelectValue placeholder="Select value..." />
                </SelectTrigger>
                <SelectContent>
                  {renderLineHighlightOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>

            <Row
              title="Editor: Line Numbers"
              description="Control the rendering of line numbers"
              isChanged={userState.editor.lineNumbers !== defaultUserState.editor.lineNumbers}
              reset={() =>
                setUserState((userState) => ({
                  ...userState,
                  editor: {
                    ...defaultUserState.editor,
                    lineNumbers: defaultUserState.editor.lineNumbers,
                  },
                }))
              }
            >
              <Select
                value={userState.editor.lineNumbers}
                onValueChange={(value) =>
                  setUserState((userState) => ({
                    ...userState,
                    editor: { ...userState.editor, lineNumbers: value as LineNumbers },
                  }))
                }
              >
                <SelectTrigger variantSize="sm">
                  <SelectValue placeholder="Select value..." />
                </SelectTrigger>
                <SelectContent>
                  {lineNumbersOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>

            <Row
              title="Preview: Position"
              description="Select the position of the Preview Window"
              isChanged={userState.previewPos !== defaultUserState.previewPos}
              reset={() =>
                setUserState((userState) => ({
                  ...userState,
                  previewPos: defaultUserState.previewPos,
                }))
              }
            >
              <Select
                value={userState.previewPos}
                onValueChange={(value) =>
                  setUserState((userState) => ({
                    ...userState,
                    previewPos: value as PreviewPosition,
                  }))
                }
              >
                <SelectTrigger variantSize="sm">
                  <SelectValue placeholder="Select value..." />
                </SelectTrigger>
                <SelectContent>
                  {previewPositionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>

            <Row
              title="AI Autocomplete: API Key"
              description="Enter your API key for the selected AI provider"
              isChanged={userState.copilot.apiKey !== defaultUserState.copilot.apiKey}
              reset={() =>
                setUserState((userState) => ({
                  ...userState,
                  copilot: { ...defaultUserState.copilot, apiKey: defaultUserState.copilot.apiKey },
                }))
              }
            >
              <Input
                placeholder="sk-"
                value={userState.copilot.apiKey}
                variantSize="sm"
                className="w-full"
                onChange={(e) =>
                  setUserState((userState) => ({
                    ...userState,
                    copilot: { ...userState.copilot, apiKey: e.target.value },
                  }))
                }
              />
            </Row>

            <Row
              title="AI Autocomplete: Provider"
              description="Select the AI provider. The accuracy and speed of autocomplete depend on the provider."
              isChanged={userState.copilot.provider !== defaultUserState.copilot.provider}
              reset={() =>
                setUserState((userState) => ({
                  ...userState,
                  copilot: {
                    ...defaultUserState.copilot,
                    provider: defaultUserState.copilot.provider,
                  },
                }))
              }
            >
              <Select
                value={userState.copilot.provider}
                onValueChange={(value) =>
                  setUserState((userState) => ({
                    ...userState,
                    copilot: {
                      ...userState.copilot,
                      provider: value as CopilotProvider,
                      model: copilotModelOptionsByProvider[value as CopilotProvider]!.includes(
                        userState.copilot.model
                      )
                        ? userState.copilot.model
                        : copilotModelOptionsByProvider[value as CopilotProvider]![0]!,
                    },
                  }))
                }
              >
                <SelectTrigger variantSize="sm">
                  <SelectValue placeholder="Select value..." />
                </SelectTrigger>
                <SelectContent>
                  {copilotProviderOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>

            <Row
              title="AI Autocomplete: Model"
              description="Select the AI model. The accuracy and speed of autocomplete depend on the model."
              isChanged={userState.copilot.model !== defaultUserState.copilot.model}
              reset={() =>
                setUserState((userState) => ({
                  ...userState,
                  copilot: {
                    ...defaultUserState.copilot,
                    model: defaultUserState.copilot.model,
                  },
                }))
              }
            >
              <Select
                value={userState.copilot.model}
                onValueChange={(value) =>
                  setUserState((userState) => ({
                    ...userState,
                    copilot: { ...userState.copilot, model: value as CopilotModel },
                  }))
                }
              >
                <SelectTrigger variantSize="sm">
                  <SelectValue placeholder="Select value..." />
                </SelectTrigger>
                <SelectContent>
                  {copilotModelOptionsByProvider[userState.copilot.provider]?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>

            <Row
              title="AI Autocomplete: Max Context Lines"
              description="Limit the number of lines included in the completion request"
              isChanged={
                userState.copilot.maxContextLines !== defaultUserState.copilot.maxContextLines
              }
              reset={() =>
                setUserState((userState) => ({
                  ...userState,
                  copilot: {
                    ...defaultUserState.copilot,
                    maxContextLines: defaultUserState.copilot.maxContextLines,
                  },
                }))
              }
            >
              <Input
                variantSize="sm"
                type="number"
                value={userState.copilot.maxContextLines}
                min={1}
                max={999}
                className="min-w-20"
                onChange={(e) =>
                  setUserState((userState) => ({
                    ...userState,
                    copilot: { ...userState.copilot, maxContextLines: e.target.valueAsNumber },
                  }))
                }
              />
            </Row>

            <Row
              title="AI Autocomplete: Use Related Files"
              isChanged={
                userState.copilot.useRelatedFiles !== defaultUserState.copilot.useRelatedFiles
              }
              reset={() =>
                setUserState((userState) => ({
                  ...userState,
                  copilot: {
                    ...defaultUserState.copilot,
                    useRelatedFiles: defaultUserState.copilot.useRelatedFiles,
                  },
                }))
              }
            >
              <div className="flex items-center">
                <Checkbox
                  id="useRelatedFiles"
                  checked={userState.copilot.useRelatedFiles}
                  variant="secondary"
                  onCheckedChange={(checked) =>
                    setUserState((userState) => ({
                      ...userState,
                      copilot: { ...userState.copilot, useRelatedFiles: !!checked },
                    }))
                  }
                />
                <label htmlFor="useRelatedFiles" className="pl-2">
                  Include related files in the completion request
                </label>
              </div>
            </Row>

            <Row
              title="AI Autocomplete: Enable Caching"
              isChanged={userState.copilot.enableCaching !== defaultUserState.copilot.enableCaching}
              reset={() =>
                setUserState((userState) => ({
                  ...userState,
                  copilot: {
                    ...defaultUserState.copilot,
                    enableCaching: defaultUserState.copilot.enableCaching,
                  },
                }))
              }
            >
              <div className="flex items-center">
                <Checkbox
                  id="enableCaching"
                  checked={userState.copilot.enableCaching}
                  variant="secondary"
                  onCheckedChange={(checked) =>
                    setUserState((userState) => ({
                      ...userState,
                      copilot: { ...userState.copilot, enableCaching: !!checked },
                    }))
                  }
                />
                <label htmlFor="enableCaching" className="pl-2">
                  Enable caching of autocomplete results
                </label>
              </div>
            </Row>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Row({
  title,
  description,
  children,
  isChanged,
  reset,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  isChanged?: boolean
  reset?: () => void
}) {
  return (
    <div className="hover:bg-card/20 group relative flex flex-col gap-1 px-6 py-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        {title}
        {isChanged && (
          <div
            className="absolute bottom-3 left-3 top-3 w-0.5 bg-blue-400/90 dark:bg-blue-400/70"
            aria-label="Changed"
          ></div>
        )}
        {isChanged && reset && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="none"
                onClick={reset}
                className="text-muted-foreground invisible p-0.5 focus:visible group-hover:visible"
              >
                <LucideUndo2 size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset to default</TooltipContent>
          </Tooltip>
        )}
      </div>
      {description && <div className="text-muted-foreground text-sm">{description}</div>}
      <div className="text-muted-foreground mt-0.5 text-sm">{children}</div>
    </div>
  )
}
