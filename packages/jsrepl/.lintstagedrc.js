import path from 'path'
import baseConfig from '../../.lintstagedrc.js'

// https://nextjs.org/docs/app/building-your-application/configuring/eslint#lint-staged
const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames.map((f) => path.relative(process.cwd(), f)).join(' --file ')}`

export default {
  ...baseConfig,
  '*.{js,jsx,ts,tsx}': [buildEslintCommand],
}
