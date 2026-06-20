export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  rich_content?: LeadCardData[] | DraftCardData[]
  timestamp: string
}

export interface LeadCardData {
  company_name: string
  domain?: string
  description?: string
  industry?: string
  employees?: number
  funding?: string
  signal?: string
  tech_stack?: string
  pain_points?: string
  fit_score: number
  contact_name?: string
  contact_title?: string
  contact_email?: string
  contact_confidence?: number
  research_summary?: string
  qualification?: {
    intent: number
    fit: number
    budget: number
    timing: number
  }
  links?: {
    website?: string
    linkedin?: string
    crunchbase?: string
  }
  added_to_pipeline?: boolean
  drafting?: boolean
}

export interface DraftCardData {
  lead_id: string
  company_name: string
  subject: string
  body: string
  status: "pending" | "editing" | "saving" | "approved" | "sent" | "rejected" | "error"
  to_email?: string
  sent_at?: string
}

export interface SSEEvent {
  event: string
  data: any
}

export interface ToolResult {
  tool: string
  status: "success" | "error" | "skipped"
  output: any
}

export interface MessageEvent {
  text: string
  suggestions: string[]
  tool_results: ToolResult[]
}

export interface ProgressStep {
  id: string
  tool: string
  label: string
  status: "pending" | "running" | "done" | "error"
}

export interface ProcessingState {
  steps: ProgressStep[]
  currentStep: number
  progress: number
  startTime: number
  elapsed: number
}

export interface SessionState {
  session_id: string | null
  messages: ChatMessage[]
  isStreaming: boolean
  processing: ProcessingState | null
  error: string | null
}

export interface ChatConfig {
  brand_id: string | null
}
