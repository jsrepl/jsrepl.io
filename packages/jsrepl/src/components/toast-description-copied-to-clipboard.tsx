export default function ToastDescriptionCopiedToClipboard({ text }: { text: string }) {
  return <pre className="line-clamp-3 overflow-hidden text-ellipsis text-xs">↪ {text}</pre>
}
