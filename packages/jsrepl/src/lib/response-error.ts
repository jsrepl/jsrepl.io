export class ResponseError extends Error {
  #response: Response
  #details: string | null = null

  readonly status: number
  readonly statusText: string
  readonly url: string

  constructor(message: string, response: Response) {
    super(message)
    this.#response = response
    this.status = response.status
    this.statusText = response.statusText
    this.url = response.url
  }

  get details(): Promise<string> {
    return this.#getDetails()
  }

  async #getDetails() {
    if (!this.#details) {
      this.#details = await this.#response.text()
    }
    return this.#details
  }
}
