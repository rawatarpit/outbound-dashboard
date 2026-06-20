import type { SSEEvent } from '@/types/chat'

export type SSEHandler = {
  onSession?: (sessionId: string) => void
  onIntent?: (data: { intent: string; confidence: number }) => void
  onPlan?: (data: { steps: Array<{ id: string; tool: string }> }) => void
  onProgress?: (data: { step_id: string; tool: string; status: "running" | "done" | "error"; data?: any; error?: string }) => void
  onMessage?: (data: { text: string; suggestions: string[]; tool_results: Array<{ tool: string; status: string; output: any }> }) => void
  onDone?: (sessionId: string) => void
  onError?: (message: string) => void
}

export async function parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  handlers: SSEHandler
): Promise<void> {
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() || ""

    let eventType = ""
    for (const line of lines) {
      if (line.startsWith("event: ")) {
        eventType = line.slice(7).trim()
      } else if (line.startsWith("data: ") && eventType) {
        try {
          const data = JSON.parse(line.slice(6))
          dispatchEvent(eventType, data, handlers)
        } catch {
          console.warn("Failed to parse SSE data:", line.slice(6))
        }
        eventType = ""
      }
    }
  }
}

function dispatchEvent(eventType: string, data: any, handlers: SSEHandler) {
  switch (eventType) {
    case "session":
      handlers.onSession?.(data.session_id)
      break
    case "intent":
      handlers.onIntent?.(data)
      break
    case "plan":
      handlers.onPlan?.(data)
      break
    case "progress":
      handlers.onProgress?.(data)
      break
    case "message":
      handlers.onMessage?.(data)
      break
    case "done":
      handlers.onDone?.(data.session_id)
      break
    case "error":
      handlers.onError?.(data.message)
      break
  }
}
