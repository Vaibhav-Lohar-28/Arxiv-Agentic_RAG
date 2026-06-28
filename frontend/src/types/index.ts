export interface Source {
  arxiv_id: string
  title: string
  authors: string
  chunk_text?: string
  score: number
}

export interface AskRequest {
  query: string
  top_k?: number
  use_hybrid?: boolean
  model?: string
  categories?: string[]
}

export interface AskResponse {
  query: string
  answer: string
  sources: Source[]
  reasoning_steps: string[]
  retrieval_attempts: number
  execution_time: number
  guardrail_score?: number
  trace_id?: string
  rewritten_query?: string
}

export interface FeedbackRequest {
  trace_id: string
  score: number
  comment?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  reasoning_steps?: string[]
  execution_time?: number
  guardrail_score?: number
  trace_id?: string
  timestamp: Date
  isStreaming?: boolean  // New: for streaming state
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface StreamCallbacks {
  onStart?: (data: { query: string }) => void
  onGuardrail?: (data: { status: string; score: number }) => void
  onReasoning?: (data: { steps: string[] }) => void
  onChunk?: (text: string) => void
  onComplete?: (data: {
    query: string
    answer: string
    sources: Source[]
    reasoning_steps: string[]
    retrieval_attempts: number
    trace_id?: string
  }) => void
  onError?: (error: Error) => void
}

export interface Settings {
  top_k: number
  use_hybrid: boolean
  model: string
  categories: string[]
}

export const AVAILABLE_MODELS = [
  { value: 'llama3.2:1b', label: 'Llama 3.2 (1B)', description: 'Fast & lightweight' },
  { value: 'llama3.2:3b', label: 'Llama 3.2 (3B)', description: 'Balanced' },
  { value: 'llama3.1:8b', label: 'Llama 3.1 (8B)', description: 'Better quality' },
  { value: 'qwen2.5:7b', label: 'Qwen 2.5 (7B)', description: 'Great for coding' },
]

export const ARXIV_CATEGORIES = [
  { value: 'cs.AI', label: 'Artificial Intelligence', description: 'AI & ML' },
  { value: 'cs.LG', label: 'Machine Learning', description: 'Learning algorithms' },
  { value: 'cs.CL', label: 'Computation & Language', description: 'NLP' },
  { value: 'cs.CV', label: 'Computer Vision', description: 'Vision & Pattern Recognition' },
  { value: 'cs.RO', label: 'Robotics', description: 'Robotics & Automation' },
  { value: 'cs.NE', label: 'Neural & Evolutionary', description: 'Neural networks' },
  { value: 'stat.ML', label: 'Statistics - ML', description: 'Statistical ML' },
]
