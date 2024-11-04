export function cssInject(css: string, id?: string) {
  const style = document.createElement('style')
  style.textContent = css
  if (id) {
    style.id = id
  }

  document.head.appendChild(style)

  return () => {
    style.remove()
  }
}
