<template>
  <div
    class="bg-background text-foreground flex h-screen select-none flex-col overflow-hidden"
    :style="{ '--hh': '2.6875rem' }"
  >
    <header class="flex h-[--hh] items-stretch border-b px-2 leading-[calc(var(--hh)-1px)]">
      <NuxtLink
        to="/"
        class="mr-24 inline-flex items-center gap-2 text-lg font-light tracking-wide max-[840px]:mr-6"
      >
        <Logo width="1.25rem" height="1.25rem" />
        <span class="text-foreground/80">JSREPL</span>
      </NuxtLink>

      <ClientOnly>
        <div class="flex">
          <span
            v-for="modelOption in modelSwitcherOptions"
            :key="modelOption.value"
            class="group relative inline-flex items-center"
          >
            <Button
              variant="none"
              size="none"
              :data-active="selectedModelName === modelOption.value"
              class="before:border-border data-[active=true]:before:border-b-editor-background data-[active=true]:before:bg-editor-background group peer px-4 py-2 before:absolute before:inset-0 before:-bottom-px data-[active=true]:cursor-default data-[active=true]:before:border data-[active=true]:before:border-t-0 data-[active=true]:before:shadow-inner"
              :class="['pr-8']"
              @click="selectedModelName = modelOption.value"
            >
              <span
                class="relative opacity-60 group-hover:opacity-100 group-data-[active=true]:opacity-80"
                >{{ modelOption.label }}</span
              >
            </Button>

            <DropdownMenu v-if="false">
              <DropdownMenuTrigger as-child>
                <Button
                  variant="ghost"
                  size="none"
                  class="text-muted-foreground hover:text-accent-foreground invisible absolute right-2 mt-px cursor-default self-center p-0.5 aria-expanded:visible peer-data-[active=true]:visible"
                >
                  <LucideEllipsisVertical :size="16" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-56">
                <DropdownMenuLabel>
                  <!-- TODO -->
                </DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        </div>

        <div class="ml-10 flex max-[840px]:ml-2">
          <span class="group relative inline-flex items-center">
            <Button
              variant="none"
              size="none"
              :data-active="isIframeShown"
              class="data-[active=true]:border-border data-[active=true]:bg-editor-background group peer border border-transparent px-4 py-1.5 before:absolute before:inset-0 data-[active=true]:shadow-inner"
              :class="['pr-8']"
              @click="toggleIframe"
            >
              <span class="opacity-60 group-hover:opacity-100 group-data-[active=true]:opacity-80"
                >Preview</span
              >
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="ghost"
                  size="none"
                  class="text-muted-foreground hover:text-accent-foreground invisible absolute right-2 mt-px cursor-default self-center p-0.5 aria-expanded:visible peer-data-[active=true]:visible"
                >
                  <LucideEllipsisVertical :size="16" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-56">
                <DropdownMenuLabel>Preview Position</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup v-model="userStoredState.previewPos">
                  <DropdownMenuRadioItem
                    v-for="option in previewPosOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        </div>

        <div class="ml-auto flex items-center self-center">
          <!-- <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Open this Repl info & config..."
            title="Open this Repl info & config..."
            class="text-secondary-foreground/60"
            :class="{ 'border border-border bg-editor-background': selectedModelName === 'info' }"
            @click="selectedModelName = selectedModelName === 'info' ? 'tsx' : 'info'"
          >
            <LucideInfo :size="18" />
          </Button> -->

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                size="icon-sm"
                variant="ghost"
                class="text-secondary-foreground/60"
                title="Choose theme..."
              >
                <LucidePalette :size="18" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-56">
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup v-model="userStoredState.theme">
                <DropdownMenuRadioItem v-for="option in Themes" :key="option.id" :value="option.id">
                  {{ option.label }}
                  <LucideMoon
                    v-if="option.isDark"
                    width="18"
                    height="18"
                    class="text-foreground/20 ml-auto"
                  />
                  <LucideSun v-else width="18" height="18" class="text-foreground/20 ml-auto" />
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="icon-sm"
            variant="ghost"
            class="text-secondary-foreground/60"
            title="Restart REPL / Reload Preview"
            @click="reloadPreview"
          >
            <LucideRotateCw :size="18" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                size="icon-sm"
                variant="ghost"
                class="text-secondary-foreground/60"
                title="Share..."
                @click="share"
              >
                <LucideShare2 :size="18" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent class="w-96">
              <DropdownMenuLabel class="text-foreground/80 text-sm font-normal">
                <ShareUrl :sharable-url="sharableUrl" />
              </DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            v-if="!user && !disableUsers"
            variant="ghost"
            size="sm"
            class="text-secondary-foreground/70"
            @click="signIn"
          >
            <Icon name="simple-icons:github" size="16" class="mr-1" />
            Sign In
          </Button>

          <DropdownMenu v-if="user && !disableUsers">
            <DropdownMenuTrigger as-child>
              <Button v-if="user" variant="ghost" size="icon-sm" class="rounded-full">
                <img
                  v-if="user.user_metadata.avatar_url"
                  :src="user.user_metadata.avatar_url"
                  width="24"
                  height="24"
                  class="rounded-full"
                />
                <div v-else-if="user.user_metadata.full_name" class="text-secondary-foreground/70">
                  {{
                    user.user_metadata.full_name
                      .split(' ', 2)
                      .map((x: string) => x[0])
                      .join('')
                  }}
                </div>
                <LucideUser v-else :size="20" class="text-secondary-foreground/70" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent class="w-56">
              <DropdownMenuLabel>
                <span class="font-medium">Logged in as<br />{{ user.email }}</span>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem @click="logout">
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ClientOnly>
    </header>

    <ClientOnly fallback-tag="main">
      <main class="bg-background relative min-h-0 flex-1">
        <div
          class="grid h-full grid-rows-1"
          :class="{
            'grid-cols-[1fr,auto]': previewPos === 'aside-right' && isIframeShown,
          }"
        >
          <Suspense>
            <CodeEditorAsync
              ref="codeEditorRef"
              class="min-w-0"
              :info-value="initialInfo"
              :tsx-value="initialTsx"
              :html-value="initialHtml"
              :css-value="initialCss"
              :tailwind-config-value="initialTailwindConfig"
              :selected-model-name="selectedModelName"
              :theme="theme"
              :preview-iframe="iframeRef"
              @info-change="onInfoChange"
              @tsx-change="onTsxChange"
              @html-change="onHtmlChange"
              @css-change="onCssChange"
              @tailwind-config-change="onTailwindConfigChange"
              @repl="onRepl"
              @repl-body-mutation="onReplBodyMutation"
            />
            <template #fallback>
              <div class="fixed inset-0 flex items-center justify-center">
                <Loader width="100" height="100" class="opacity-10" />
              </div>
            </template>
          </Suspense>

          <div
            ref="iframeContainerRef"
            :class="{
              relative: previewPos === 'aside-right',
              'absolute bottom-1 right-4 z-10': previewPos === 'float-bottom-right',
              'absolute right-4 top-1 z-10': previewPos === 'float-top-right',
              'pointer-events-none !absolute translate-x-[calc(100%+3rem)] opacity-0':
                !isIframeShown,
            }"
          >
            <!-- iframe must not be .sr-only or .hidden, otherwise timer are throttled (e.g. setInterval throttled to 1s) -->
            <Resizable
              v-model="previewSize"
              left
              :top="previewPos === 'float-bottom-right'"
              :bottom="previewPos === 'float-top-right'"
              :class="{
                '!h-full pl-2': previewPos === 'aside-right',
                'max-h-[calc(100vh-0.25rem-var(--hh))] max-w-[calc(100vw-1rem)] p-4':
                  previewPos === 'float-bottom-right' || previewPos === 'float-top-right',
              }"
            >
              <iframe
                ref="iframeRef"
                :src="previewUrl"
                width="100%"
                height="100%"
                class="bg-secondary"
                :class="{
                  'border-border rounded border opacity-90 shadow-lg':
                    previewPos === 'float-bottom-right' || previewPos === 'float-top-right',
                  'border-l': previewPos === 'aside-right',
                }"
              />
            </Resizable>

            <Button
              v-if="iframeMightBeHidden"
              variant="secondary"
              class="text-secondary-foreground absolute inset-0 z-10 m-auto w-fit opacity-60 hover:opacity-100 focus:opacity-100"
              @click="toggleIframe(false)"
            >
              Close Preview
            </Button>
          </div>
        </div>
      </main>

      <template #fallback>
        <div class="fixed inset-0 flex items-center justify-center">
          <Loader width="100" height="100" class="opacity-10" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import Resizable from '@/components/Resizable.vue'
import { Button } from '@/components/ui/button'
import { useEarlyAccessToast } from '@/composables/toasts/useEarlyAccessToast'
import { useReplStoredState } from '@/composables/useReplStoredState'
import type { InfoModelShared } from '@/utils/info-model-shared'
import type { TsxModelShared } from '@/utils/tsx-model-shared'
import debounce from 'debounce'
import {
  LucideEllipsisVertical,
  LucideMoon,
  LucidePalette,
  LucideRotateCw,
  LucideShare2,
  LucideSun,
  LucideUser,
} from 'lucide-vue-next'
import type CodeEditor from '~/components/CodeEditor.vue'
import { useNewVersionToast } from '~/composables/toasts/useNewVersionToast'
import { PreviewPosition, type ThemeDef } from '~/types/repl.types'
import type { CssModelShared } from '~/utils/css-model-shared'
import type { HtmlModelShared } from '~/utils/html-model-shared'
import { getReplTitle } from '~/utils/repl-title'
import type { TailwindConfigModelShared } from '~/utils/tailwind-config-model-shared'
import { Themes } from '~/utils/themes'

definePageMeta({
  layout: 'custom',
})

const CodeEditorAsync = defineAsyncComponent(() => import('~/components/CodeEditor.vue'))

const user = useSupabaseUser()
const supabase = useSupabaseClient()

const [userStoredState, loadUserStoredState, saveUserStoredState] = useUserStoredState()
loadUserStoredState()
if (import.meta.client) {
  watch(
    userStoredState,
    () => {
      saveUserStoredState()
    },
    { deep: true }
  )
}

const [replStoredState, loadReplStoredState, saveReplStoredState] = useReplStoredState()
loadReplStoredState()
if (import.meta.client) {
  watch(
    replStoredState,
    () => {
      saveReplStoredState()
    },
    { deep: true }
  )
}

const initialInfo = replStoredState.value.info
const initialTsx = replStoredState.value.tsx
const initialHtml = replStoredState.value.html
const initialCss = replStoredState.value.css
const initialTailwindConfig = replStoredState.value.tailwindConfig

const selectedModelName = ref<'info' | 'tsx' | 'html' | 'css' | 'tailwindConfig'>(
  replStoredState.value.currentModelName
)

watch(selectedModelName, () => {
  replStoredState.value.currentModelName = selectedModelName.value
})

const iframeRef = shallowRef<HTMLIFrameElement | null>(null)
const iframeContainerRef = shallowRef<HTMLDivElement | null>(null)
const codeEditorRef = shallowRef<typeof CodeEditor | null>(null)

const isIframeShown = ref(replStoredState.value.showPreview)

watch(isIframeShown, () => {
  replStoredState.value.showPreview = isIframeShown.value
})

const iframeMightBeHidden = ref(false)
const floatPreviewSize = ref({ width: 350, height: 180 })
const asidePreviewSize = ref({ width: 350, height: 0 })
let hideIframeTimeoutId: NodeJS.Timeout | undefined

// There is no functionality related to logged in users yet.
const disableUsers = true

const modelSwitcherOptions: {
  value: 'info' | 'tsx' | 'html' | 'css' | 'tailwindConfig'
  label: string
}[] = [
  // { value: 'info', label: 'About' },
  { value: 'tsx', label: 'TS/TSX' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'tailwindConfig', label: 'tailwind.config.ts' },
]

const previewPosOptions = [
  { value: PreviewPosition.FloatTopRight, label: 'Floating: top right' },
  { value: PreviewPosition.FloatBottomRight, label: 'Floating: bottom right' },
  { value: PreviewPosition.AsideRight, label: 'Dock to right' },
]

const theme: ComputedRef<ThemeDef> = computed(() => {
  return Themes.find((theme) => theme.id === userStoredState.value.theme) ?? Themes[0]
})

const previewPos = computed(() => userStoredState.value.previewPos)

const sharableUrl = ref('')

const replTitle = computed<string>(() => getReplTitle(replStoredState.value))

useEarlyAccessToast()
useNewVersionToast(userStoredState)

useHead({
  title: replTitle,
  bodyAttrs: {
    class: () => (theme.value ? `theme-${theme.value.id}` : ''),
  },
})

const previewSize = computed({
  get() {
    switch (previewPos.value) {
      case 'float-bottom-right':
      case 'float-top-right':
        return floatPreviewSize.value
      case 'aside-right':
        return asidePreviewSize.value
      default:
        return { width: 0, height: 0 }
    }
  },
  set(value) {
    switch (previewPos.value) {
      case 'float-bottom-right':
      case 'float-top-right':
        floatPreviewSize.value = value
        asidePreviewSize.value.width = value.width
        break
      case 'aside-right':
        asidePreviewSize.value = value
        floatPreviewSize.value.width = value.width
        break
    }
  },
})

const runtimeConfig = useRuntimeConfig()
const previewUrl = runtimeConfig.public.previewUrl

const debouncedInfoSave = debounce((infoModelShared: InfoModelShared) => {
  replStoredState.value.info = infoModelShared.getValue()
}, 500)

const debouncedTsxSave = debounce((tsxModelShared: TsxModelShared) => {
  replStoredState.value.tsx = tsxModelShared.getValue()
}, 500)

const debouncedHtmlSave = debounce((htmlModelShared: HtmlModelShared) => {
  replStoredState.value.html = htmlModelShared.getValue()
}, 500)

const debouncedCssSave = debounce((cssModelShared: CssModelShared) => {
  replStoredState.value.css = cssModelShared.getValue()
}, 500)

const debouncedTailwindConfigSave = debounce(
  (tailwindConfigModelShared: TailwindConfigModelShared) => {
    replStoredState.value.tailwindConfig = tailwindConfigModelShared.getValue()
  },
  500
)

onMounted(() => {
  window.addEventListener('beforeunload', onWindowBeforeUnload)
})

onBeforeUnmount(() => {
  debouncedTsxSave.flush()
  debouncedHtmlSave.flush()
  debouncedCssSave.flush()
  clearTimeout(hideIframeTimeoutId)
  window.removeEventListener('beforeunload', onWindowBeforeUnload)
})

function toggleIframe(force?: boolean) {
  if (typeof force === 'boolean' && isIframeShown.value === force) {
    return
  }

  isIframeShown.value = typeof force === 'boolean' ? force : !isIframeShown.value
}

function onInfoChange(infoModelShared: InfoModelShared) {
  debouncedInfoSave(infoModelShared)
}

function onTsxChange(tsxModelShared: TsxModelShared) {
  debouncedTsxSave(tsxModelShared)
}

function onHtmlChange(htmlModelShared: HtmlModelShared) {
  debouncedHtmlSave(htmlModelShared)
}

function onCssChange(cssModelShared: CssModelShared) {
  debouncedCssSave(cssModelShared)
}

function onTailwindConfigChange(tailwindConfigModelShared: TailwindConfigModelShared) {
  debouncedTailwindConfigSave(tailwindConfigModelShared)
}

function onRepl() {
  clearTimeout(hideIframeTimeoutId)

  hideIframeTimeoutId = setTimeout(() => {
    iframeMightBeHidden.value = true
  }, 1000)
}

function onReplBodyMutation() {
  clearTimeout(hideIframeTimeoutId)
  iframeMightBeHidden.value = false
}

function onWindowBeforeUnload() {
  debouncedInfoSave.flush()
  debouncedTsxSave.flush()
  debouncedHtmlSave.flush()
  debouncedCssSave.flush()
  debouncedTailwindConfigSave.flush()
}

async function share() {
  await saveReplStoredState()
  const url = location.href
  sharableUrl.value = url
}

function reloadPreview() {
  const tsxModelShared = codeEditorRef.value?.getTsxModelShared() as
    | TsxModelShared
    | null
    | undefined

  if (!tsxModelShared) {
    return
  }

  tsxModelShared.model.setValue(tsxModelShared.getValue())
}

async function signIn() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: location.origin + '/confirm/?next=' + location.pathname + location.search,
    },
  })

  if (error) console.log(error)
}

async function logout() {
  await supabase.auth.signOut()
}
</script>
