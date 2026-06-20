import { createContext, useContext, useReducer, useCallback, useRef, type ReactNode } from 'react'
import type { ChatMessage, ProcessingState, ProgressStep } from '@/types/chat'
import { parseSSEStream } from '@/lib/sse'
import { useAuth } from './AuthContext'

interface ChatState {
  messages: ChatMessage[]
  sessionId: string | null
  isStreaming: boolean
  processing: ProcessingState | null
  error: string | null
}

type ChatAction =
  | { type: "ADD_USER_MESSAGE"; payload: ChatMessage }
  | { type: "SET_SESSION"; payload: string }
  | { type: "SET_STREAMING"; payload: boolean }
  | { type: "SET_PROCESSING"; payload: ProcessingState | null }
  | { type: "UPDATE_STEP"; payload: { step_id: string; status: "running" | "done" | "error"; error?: string } }
  | { type: "ADD_ASSISTANT_MESSAGE"; payload: ChatMessage }
  | { type: "APPEND_ASSISTANT_TEXT"; payload: string }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_CHAT" }
  | { type: "UPDATE_STEP_PROGRESS"; payload: { current: number; total: number } }

const initialProcessing: ProcessingState = {
  steps: [],
  currentStep: 0,
  progress: 0,
  startTime: Date.now(),
  elapsed: 0,
}

const initialState: ChatState = {
  messages: [],
  sessionId: null,
  isStreaming: false,
  processing: null,
  error: null,
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_USER_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] }
    case "SET_SESSION":
      return { ...state, sessionId: action.payload }
    case "SET_STREAMING":
      return { ...state, isStreaming: action.payload }
    case "SET_PROCESSING":
      return { ...state, processing: action.payload }
    case "UPDATE_STEP": {
      if (!state.processing) return state
      const steps = state.processing.steps.map((s) =>
        s.id === action.payload.step_id ? { ...s, status: action.payload.status } : s
      )
      const doneCount = steps.filter((s) => s.status === "done" || s.status === "error").length
      const progress = Math.round((doneCount / steps.length) * 100)
      return {
        ...state,
        processing: {
          ...state.processing,
          steps,
          currentStep: doneCount,
          progress,
          elapsed: Date.now() - state.processing.startTime,
        },
      }
    }
    case "ADD_ASSISTANT_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] }
    case "APPEND_ASSISTANT_TEXT": {
      const msgs = [...state.messages]
      const last = msgs[msgs.length - 1]
      if (last && last.role === "assistant") {
        msgs[msgs.length - 1] = { ...last, content: last.content + action.payload }
      }
      return { ...state, messages: msgs }
    }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "CLEAR_CHAT":
      return { ...initialState, sessionId: state.sessionId }
    default:
      return state
  }
}

interface ChatContextType extends ChatState {
  sendMessage: (text: string) => Promise<void>
  clearChat: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const { token } = useAuth()
  const abortRef = useRef<AbortController | null>(null)

  const clearChat = useCallback(() => {
    dispatch({ type: "CLEAR_CHAT" })
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || state.isStreaming) return

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    }
    dispatch({ type: "ADD_USER_MESSAGE", payload: userMsg })
    dispatch({ type: "SET_STREAMING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null })

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    }
    dispatch({ type: "ADD_ASSISTANT_MESSAGE", payload: assistantMsg })

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: text,
            session_id: state.sessionId,
          }),
          signal: controller.signal,
        }
      )

      if (!response.ok) {
        throw new Error(`Chat API returned ${response.status}`)
      }

      const reader = response.body!.getReader()

      await parseSSEStream(reader, {
        onSession: (sessionId) => {
          dispatch({ type: "SET_SESSION", payload: sessionId })
        },
        onPlan: (data) => {
          const steps: ProgressStep[] = data.steps.map((s: any) => ({
            id: s.id,
            tool: s.tool,
            label: formatToolLabel(s.tool),
            status: "pending" as const,
          }))
          dispatch({
            type: "SET_PROCESSING",
            payload: {
              steps,
              currentStep: 0,
              progress: 0,
              startTime: Date.now(),
              elapsed: 0,
            },
          })
        },
        onProgress: (data) => {
          dispatch({
            type: "UPDATE_STEP",
            payload: { step_id: data.step_id, status: data.status, error: data.error },
          })
        },
        onMessage: (data) => {
          dispatch({
            type: "APPEND_ASSISTANT_TEXT",
            payload: data.text,
          })
        },
        onDone: () => {
          dispatch({ type: "SET_PROCESSING", payload: null })
          dispatch({ type: "SET_STREAMING", payload: false })
        },
        onError: (message) => {
          dispatch({ type: "SET_ERROR", payload: message })
          dispatch({ type: "SET_PROCESSING", payload: null })
          dispatch({ type: "SET_STREAMING", payload: false })
        },
      })
    } catch (err: any) {
      if (err.name !== "AbortError") {
        dispatch({ type: "SET_ERROR", payload: err.message || "Network error" })
        dispatch({ type: "SET_PROCESSING", payload: null })
        dispatch({ type: "SET_STREAMING", payload: false })
      }
    }
  }, [state.isStreaming, state.sessionId, token])

  return (
    <ChatContext.Provider value={{ ...state, sendMessage, clearChat }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}

function formatToolLabel(tool: string): string {
  const labels: Record<string, string> = {
    discover_leads: "Searching for leads",
    research_leads: "Researching companies",
    enrich_leads: "Finding contacts",
    qualify_leads: "Qualifying leads",
    draft_emails: "Drafting emails",
    get_pipeline: "Checking pipeline",
  }
  return labels[tool] || tool.replace(/_/g, " ")
}
