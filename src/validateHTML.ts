export interface ValidateHTMLOptions {
  htmlData: string
}

export interface ValidationMessage {
  type: "error" | "info" | "non-document-error"
  subType?: "warning" | "fatal" | "internal" | "io" | "schema"
  message: string
  extract?: string
  lastLine: number
  firstColumn: number
  lastColumn: number
}

export interface ValidateHTMLResult {
  messages: ValidationMessage[]
}

export const validateHTML = async (
  options: ValidateHTMLOptions,
): Promise<ValidateHTMLResult> => {
  const { htmlData } = options
  const url = new URL("https://validator.w3.org/nu/")
  url.searchParams.set("out", "json")
  const response = await fetch(url, {
    method: "POST",
    body: htmlData,
    headers: {
      "Content-Type": "text/html",
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to validate HTML`)
  }
  const result = (await response.json()) as ValidateHTMLResult
  return result
}

export const getHTMLFromURL = async (url: string): Promise<string> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch HTML from "${url}"`)
  }
  const html = await response.text()
  return html
}
