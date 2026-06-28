import axios from 'axios'
import type { AskRequest, AskResponse, FeedbackRequest } from '@/types'

// Use relative path so Nginx can proxy to backend
const API_BASE_URL = '/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes - RAG can take long
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - the server is taking too long to respond')
    } else if (error.response?.status === 504) {
      console.error('Gateway timeout - please try again with a simpler query')
    }
    return Promise.reject(error)
  }
)

// Fast RAG endpoint (default - single pass, quicker)
export async function askFast(request: AskRequest): Promise<AskResponse> {
  const response = await apiClient.post('/ask-fast', request)
  return response.data
}

// Agentic RAG endpoint (slower but more thorough)
export async function askAgentic(request: AskRequest): Promise<AskResponse> {
  const response = await apiClient.post('/ask-agentic', request)
  return response.data
}

export async function submitFeedback(request: FeedbackRequest): Promise<{ success: boolean }> {
  const response = await apiClient.post('/feedback', request)
  return response.data
}

export async function healthCheck(): Promise<{ status: string }> {
  const response = await apiClient.get('/health')
  return response.data
}
