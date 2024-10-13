import ReplPlaygroundMain from './repl-playground-main'
import ReplPlaygroundProviders from './repl-playground-providers'

export default function ReplPlayground() {
  return (
    <ReplPlaygroundProviders>
      <ReplPlaygroundMain />
    </ReplPlaygroundProviders>
  )
}
