export async function requestJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  const rawBody = await response.text()
  const parsedBody = rawBody ? JSON.parse(rawBody) : null

  if (!response.ok) {
    const message =
      (parsedBody as { message?: string } | null)?.message ??
      response.statusText ??
      'Request failed'
    throw new Error(message)
  }

  return parsedBody as T
}