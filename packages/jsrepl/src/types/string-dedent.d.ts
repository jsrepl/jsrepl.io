declare module 'string-dedent' {
  declare type Tag<A extends unknown[], R, T> = (
    this: T,
    strings: TemplateStringsArray,
    ...substitutions: A
  ) => R
  declare function dedent(str: string): string
  declare function dedent(str: TemplateStringsArray, ...substitutions: unknown[]): string
  declare function dedent<A extends unknown[], R, T>(tag: Tag<A, R, T>): Tag<A, R, T>
  export default dedent
}
