export function cssInject(css: string) {
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)

  return () => {
    style.remove()
  }
}
