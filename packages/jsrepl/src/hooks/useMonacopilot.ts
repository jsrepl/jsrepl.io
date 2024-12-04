import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  CompletionMetadata,
  Copilot,
  CopilotOptions,
  RegisterCompletionOptions,
  registerCompletion,
} from '@nag5000/monacopilot'
import * as monaco from 'monaco-editor'
import { CodeEditorModel } from '@/lib/code-editor-model'
import { useMonacoEditor } from './useMonacoEditor'
import { useReplModels } from './useReplModels'
import { useReplStoredState } from './useReplStoredState'
import { useUserStoredState } from './useUserStoredState'

type RequestHandler = Exclude<RegisterCompletionOptions['requestHandler'], undefined>

export default function useMonacopilot() {
  const [editorRef] = useMonacoEditor()
  const { models } = useReplModels()
  const [replState] = useReplStoredState()
  const [userState] = useUserStoredState()
  const recentModelsRef = useRef<CodeEditorModel[]>([])
  const relatedModelsRef = useRef<CodeEditorModel[]>([])

  const apiKey = useMemo(() => {
    return userState.copilot.apiKey
  }, [userState.copilot.apiKey])

  const copilotOptions = useMemo<CopilotOptions>(() => {
    return {
      provider: userState.copilot.provider,
      model: userState.copilot.model,
    } as CopilotOptions
  }, [userState.copilot.provider, userState.copilot.model])

  const isEnabled = useMemo(() => {
    return !!apiKey && copilotOptions.provider && copilotOptions.model
  }, [apiKey, copilotOptions])

  const providerCustomHeaders = useMemo(() => {
    const { provider } = copilotOptions
    if (provider === 'anthropic') {
      return {
        'anthropic-dangerous-direct-browser-access': 'true',
      }
    }

    return undefined
  }, [copilotOptions])

  const copilot = useMemo(() => {
    try {
      return isEnabled ? new Copilot(apiKey, copilotOptions) : null
    } catch (error) {
      console.error('Monacopilot error:', error)
      return null
    }
  }, [apiKey, copilotOptions, isEnabled])

  const requestHandler = useCallback<RequestHandler>(
    async ({ body }) => {
      if (!copilot) {
        return { completion: null }
      }

      try {
        const completionResponse = await copilot.complete({
          body,
          options: {
            headers: providerCustomHeaders,
            customPrompt,
          },
        })

        const { error } = completionResponse
        let { completion } = completionResponse

        if (error) {
          console.error('Monacopilot error:', error)
        }

        if (completion) {
          completion = completion.replace(/<COMPLETION>([\s\S]*?)<\/COMPLETION>/g, '$1')
          if (completion === '') {
            completion = null
          }
        }

        return { completion }
      } catch (error) {
        console.error('Monacopilot error:', error)
        return { completion: null }
      }
    },
    [copilot, providerCustomHeaders]
  )

  useEffect(() => {
    if (!userState.copilot.enableRelatedFiles) {
      return
    }

    recentModelsRef.current = Array.from(
      new Set(
        [
          replState.activeModel ? models.get(replState.activeModel) : undefined,
          ...recentModelsRef.current,
          ...models.values(),
        ].filter((x) => x !== undefined)
      )
    ).slice(0, 3)

    relatedModelsRef.current = recentModelsRef.current.filter(
      (model) => model.filePath !== replState.activeModel
    )
  }, [models, replState.activeModel, userState.copilot.enableRelatedFiles])

  useEffect(() => {
    if (!editorRef.current) {
      return
    }

    if (!isEnabled) {
      return
    }

    const completion = registerCompletion(monaco, editorRef.current, {
      endpoint: '',
      language: [
        { language: 'typescript', exclusive: true },
        { language: 'javascript', exclusive: true },
        { language: 'html', exclusive: true },
        { language: 'css', exclusive: true },
        { language: 'json', exclusive: true },
        { language: 'markdown', exclusive: true },
      ],
      trigger: 'onTyping',
      enableCaching: userState.copilot.enableCaching,
      maxContextLines: userState.copilot.maxContextLines,
      requestHandler,
      get relatedFiles() {
        if (!userState.copilot.enableRelatedFiles) {
          return undefined
        }

        return relatedModelsRef.current.map((model) => ({
          content: model.getValue(),
          path: model.filePath,
        }))
      },
    })

    return () => {
      completion.deregister()
    }
  }, [
    editorRef,
    isEnabled,
    requestHandler,
    userState.copilot.enableCaching,
    userState.copilot.maxContextLines,
    userState.copilot.enableRelatedFiles,
  ])
}

function customPrompt(metadata: CompletionMetadata) {
  const {
    textBeforeCursor = '',
    textAfterCursor = '',
    //editorState: {completionMode},
    language,
    relatedFiles,
    selectedSuggestionText,
  } = metadata

  // Based on https://github.com/VictorTaelin/AI-scripts
  const system = `You are a HOLE FILLER. You are provided with a file containing holes, formatted as '{{FILL_HERE}}'. 
Your TASK is to complete with a string to replace this hole with, inside a <COMPLETION/> XML tag.
All completions MUST be truthful, accurate, well-written, and correct for the specified language and environment.
Completion can be multiline. Make sure completion indented and formatted correctly with the surrounding code.
Try to match Prettier's style.
Start completion with new line ("\\n") if appropriate.
You may use the related files to help you complete the holes.
You must return empty completion (<COMPLETION></COMPLETION>) if there is no suitable completion for the hole.
You must return empty completion if the code around the hole seems to be already complete and correct.
You must return empty completion in all other cases when the completion is not obvious.
If SUGGESTION_TEXT is provided, the beginning of the completion must match SUGGESTION_TEXT.

## EXAMPLE QUERY:

<QUERY>
function sum_evens(lim) {
  var sum = 0;
  for (var i = 0; i < lim; ++i) {
    {{FILL_HERE}}
  }
  return sum;
}
</QUERY>

TASK: Fill the {{FILL_HERE}} hole.

## CORRECT COMPLETION

<COMPLETION>if (i % 2 === 0) {
      sum += i;
    }</COMPLETION>

## EXAMPLE QUERY:

<QUERY>
const d = new Dat{{FILL_HERE}}
</QUERY>

## CORRECT COMPLETION

<COMPLETION>e()</COMPLETION>

## EXAMPLE QUERY:

<QUERY>
const a = 0.1;
const b = 0.2;{{FILL_HERE}}
</QUERY>

## CORRECT COMPLETION

<COMPLETION>
const sum = a + b;</COMPLETION>

## EXAMPLE QUERY:

The 5th {{FILL_HERE}} is Jupiter.

## CORRECT COMPLETION:

<COMPLETION>planet from the Sun</COMPLETION>

## EXAMPLE QUERY:

function hypothenuse(a, b) {
  return Math.sqrt({{FILL_HERE}}b ** 2);
}

## CORRECT COMPLETION:

<COMPLETION>a ** 2 + </COMPLETION>`

  const user = `<QUERY>\n${textBeforeCursor}{{FILL_HERE}}${textAfterCursor}\n</QUERY>
Language: ${language || 'unknown'}
Environment: Browser, ESM modules
Related Files: ${
    relatedFiles
      ?.map(
        ({ content, path }) =>
          `\n\tPath: ${path}\n\tContent:\n\t\t${content.split('\n').join('\n\t\t')}`
      )
      .join('\n') || 'None'
  }
${selectedSuggestionText ? `SUGGESTION_TEXT: ${selectedSuggestionText}` : ''}
TASK: Fill the {{FILL_HERE}} hole. Answer only with the CORRECT completion, and NOTHING ELSE. Do it now.`

  return { system, user }
}
