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
              :data-active="activeModel === modelOption.value"
              class="before:border-border data-[active=true]:before:border-b-editor-background data-[active=true]:before:bg-editor-background group peer px-4 py-2 before:absolute before:inset-0 before:-bottom-px data-[active=true]:cursor-default data-[active=true]:before:border data-[active=true]:before:border-t-0 data-[active=true]:before:shadow-inner"
              :class="['pr-8']"
              @click="activeModel = modelOption.value"
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
              :data-active="preview.shown.value"
              class="data-[active=true]:border-border data-[active=true]:bg-editor-background group peer border border-transparent px-4 py-1.5 before:absolute before:inset-0 data-[active=true]:shadow-inner"
              :class="['pr-8']"
              @click="preview.toggle"
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
                <DropdownMenuRadioGroup v-model="preview.position.value">
                  <DropdownMenuRadioItem
                    v-for="option in preview.positionOptions"
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
            @click="preview.reload"
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
            'grid-cols-[1fr,auto]': preview.position.value === 'aside-right' && preview.shown.value,
          }"
        >
          <Suspense>
            <CodeEditorAsync
              ref="codeEditorRef"
              class="min-w-0"
              :model-definitions="modelDefinitions"
              :active-model="activeModel"
              :theme="theme"
              :preview-iframe="previewIframeRef"
              @model-change="onModelChange"
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
            :class="{
              relative: preview.position.value === 'aside-right',
              'absolute bottom-1 right-4 z-10': preview.position.value === 'float-bottom-right',
              'absolute right-4 top-1 z-10': preview.position.value === 'float-top-right',
              'pointer-events-none !absolute translate-x-[calc(100%+3rem)] opacity-0':
                !preview.shown.value,
            }"
          >
            <!-- iframe must not be .sr-only or .hidden, otherwise timer are throttled (e.g. setInterval throttled to 1s) -->
            <Resizable
              v-model="preview.size.value"
              left
              :top="preview.position.value === 'float-bottom-right'"
              :bottom="preview.position.value === 'float-top-right'"
              :class="{
                '!h-full pl-2': preview.position.value === 'aside-right',
                'max-h-[calc(100vh-0.25rem-var(--hh))] max-w-[calc(100vw-1rem)] p-4':
                  preview.position.value === 'float-bottom-right' ||
                  preview.position.value === 'float-top-right',
              }"
            >
              <iframe
                ref="previewIframeRef"
                :src="previewUrl"
                width="100%"
                height="100%"
                class="bg-secondary"
                :class="{
                  'border-border rounded border opacity-90 shadow-lg':
                    preview.position.value === 'float-bottom-right' ||
                    preview.position.value === 'float-top-right',
                  'border-l': preview.position.value === 'aside-right',
                }"
              />
            </Resizable>

            <Button
              v-if="preview.mightBeHidden.value"
              variant="secondary"
              class="text-secondary-foreground absolute inset-0 z-10 m-auto w-fit opacity-60 hover:opacity-100 focus:opacity-100"
              @click="preview.toggle(false)"
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
import { usePreview } from '~/composables/usePreview'
import { type ThemeDef } from '~/types/repl.types'
import { getReplTitle } from '~/utils/repl-title'
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
const debouncedSaveReplStoredState = debounce(saveReplStoredState, 500)
loadReplStoredState()
if (import.meta.client) {
  watch(
    replStoredState,
    () => {
      debouncedSaveReplStoredState()
    },
    { deep: true }
  )
}

const modelDefinitions = ref(replStoredState.value.models)
const activeModel = ref<string>(replStoredState.value.activeModel)

watch(activeModel, () => {
  replStoredState.value.activeModel = activeModel.value
})

const previewIframeRef = shallowRef<HTMLIFrameElement | null>(null)
const codeEditorRef = shallowRef<typeof CodeEditor | null>(null)

// There is no functionality related to logged in users yet.
const disableUsers = true

const modelSwitcherOptions = computed(() => {
  return Array.from(modelDefinitions.value.values()).map((model) => {
    const label = model.uri.replace('file:///', '')
    return { value: model.uri, label }
  })
})

const theme: ComputedRef<ThemeDef> = computed(() => {
  return Themes.find((theme) => theme.id === userStoredState.value.theme) ?? Themes[0]
})

const sharableUrl = ref('')

const replTitle = computed<string>(() => getReplTitle(replStoredState.value))
const runtimeConfig = useRuntimeConfig()
const previewUrl = runtimeConfig.public.previewUrl

useEarlyAccessToast()
useNewVersionToast(userStoredState)

const preview = usePreview({
  codeEditorRef,
  userStoredState,
  replStoredState,
})

useHead({
  title: replTitle,
  bodyAttrs: {
    class: () => (theme.value ? `theme-${theme.value.id}` : ''),
  },
})

onMounted(() => {
  window.addEventListener('beforeunload', onWindowBeforeUnload)
})

onBeforeUnmount(() => {
  debouncedSaveReplStoredState.flush()
  window.removeEventListener('beforeunload', onWindowBeforeUnload)
})

function onModelChange(editorModel: InstanceType<typeof CodeEditorModel>) {
  const uri = editorModel.monacoModel.uri.toString()
  replStoredState.value.models.set(uri, {
    uri,
    content: editorModel.getValue(),
  })
}

function onWindowBeforeUnload() {
  debouncedSaveReplStoredState.flush()
}

async function share() {
  await saveReplStoredState()
  const url = location.href
  sharableUrl.value = url
}

function onRepl() {
  preview.onRepl()
}

function onReplBodyMutation() {
  preview.onReplBodyMutation()
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
