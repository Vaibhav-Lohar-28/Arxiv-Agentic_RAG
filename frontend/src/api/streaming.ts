import type { StreamCallbacks } from '@/types'

const API_BASE_URL = '/api/v1'

export interface StreamRequest {
  query: string
  top_k?: number
  use_hybrid?: boolean
  model?: string
  conversation_id?: string | null
}

export async function askStreaming(
  request: StreamRequest,
  callbacks: StreamCallbacks
): Promise<void> {
  const { onStart, onGuardrail, onReasoning, onChunk, onComplete, onError } = callbacks
  
  try {
    const response = await fetch(`${API_BASE_URL}/ask-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No reader available')
    }

    const decoder = new TextDecoder()
    let buffer = ''
    let currentEvent: string | null = null

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim()
        } else if (line.startsWith('data:') && currentEvent) {
          try {
            const dataStr = line.slice(5).trim()
            if (!dataStr) continue
            
            const data = JSON.parse(dataStr)
            
            switch (currentEvent) {
              case 'start':
                onStart?.(data)
                break
              case 'guardrail':
                onGuardrail?.(data)
                break
              case 'reasoning':
                onReasoning?.(data)
                break
              case 'chunk':
                if (data.text) {
                  onChunk?.(data.text)
                }
                break
              case 'complete':
                onComplete?.(data)
                break
              case 'error':
                onError?.(new Error(data.error || 'Unknown error'))
                break
            }
          } catch (parseError) {
            console.error('Failed to parse SSE data:', parseError)
          }
          currentEvent = null
        }
      }
    }
  } catch (error) {
    console.error('Streaming error:', error)
    onError?.(error as Error)
    throw error
  }
}
