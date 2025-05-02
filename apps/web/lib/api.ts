import type { Conversation, Message } from '@/types/chat'

const API_BASE_URL = 'http://localhost:3000/api/chat'

// Default fetch options with CORS credentials
const defaultFetchOptions: RequestInit = {
  credentials: 'include', // Include cookies for cross-origin requests
  headers: {
    'Content-Type': 'application/json',
    accept: 'application/json',
  },
}

// Error handling helper
async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.message || `API error: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

// Conversation Management
export async function getConversations(): Promise<Conversation[]> {
  const response = await fetch(`${API_BASE_URL}/conversations`, defaultFetchOptions)
  const data = await handleResponse(response)
  return data.data
}

export async function getConversation(id: string): Promise<Conversation> {
  const response = await fetch(`${API_BASE_URL}/conversations/${id}`, defaultFetchOptions)
  const data = await handleResponse(response)
  return data.data
}

export async function createConversation(title: string): Promise<Conversation> {
  const response = await fetch(`${API_BASE_URL}/conversations`, {
    ...defaultFetchOptions,
    method: 'POST',
    body: JSON.stringify({ title }),
  })
  const data = await handleResponse(response)
  return data.data
}

export async function deleteConversation(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/conversations/${id}`, {
    ...defaultFetchOptions,
    method: 'DELETE',
  })
  await handleResponse(response)
}

// Message Management
export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const response = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}/messages`,
    defaultFetchOptions
  )
  const data = await handleResponse(response)
  return data.data
}

export async function sendMessage(
  conversationId: string,
  content: string,
  role: 'user' | 'assistant' | 'system' = 'user'
): Promise<Message> {
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
    ...defaultFetchOptions,
    method: 'POST',
    body: JSON.stringify({ content, role }),
  })
  const data = await handleResponse(response)
  return data.data
}

// Streaming Completion
export async function streamCompletion(
  conversationId: string,
  message: string,
  onChunk: (chunk: { id: string; content: string; done: boolean }) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/completions`, {
    ...defaultFetchOptions,
    method: 'POST',
    headers: {
      ...defaultFetchOptions.headers,
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ message }),
    signal,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Stream error: ${response.status} ${errorText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('Response body is not readable')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6))
          onChunk(data)

          if (data.done) {
            return
          }
        } catch (e) {
          console.error('Error parsing SSE data:', e)
        }
      }
    }
  }
}

// RAG Document Management
export async function addDocument(
  content: string,
  metadata?: Record<string, any>
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    ...defaultFetchOptions,
    method: 'POST',
    body: JSON.stringify({ content, metadata }),
  })
  const data = await handleResponse(response)
  return data.data.id
}

// Simple Chat (for testing)
export async function simpleChat(content: string): Promise<Message> {
  const response = await fetch(`${API_BASE_URL}/simple-chat`, {
    ...defaultFetchOptions,
    method: 'POST',
    body: JSON.stringify({ content }),
  })
  const data = await handleResponse(response)
  return data.data
}
