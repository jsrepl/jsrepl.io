/**
 * Get file extension from file path.
 * @param filePath - File path.
 * @returns File extension including the dot, e.g. `.ts`.
 *          If there is no extension, returns an empty string.
 *          The extension is in lowercase.
 */
export function getFileExtension(filePath: string) {
  const dotLastIndex = filePath.lastIndexOf('.')
  return dotLastIndex === -1 ? '' : filePath.slice(dotLastIndex).toLowerCase()
}
