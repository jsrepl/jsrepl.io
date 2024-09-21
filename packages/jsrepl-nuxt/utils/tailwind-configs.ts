export const defaultTailwindConfigTs = `import type { Config } from 'tailwindcss';

export default {
  content: ['**/*'],
  corePlugins: {
    preflight: false,
  },
  darkMode: 'class',
} satisfies Config;
`

export const defaultTailwindConfigJson = {
  corePlugins: {
    preflight: false,
  },
  darkMode: 'class',
}
