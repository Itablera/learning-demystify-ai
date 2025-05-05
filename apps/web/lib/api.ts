import type { Conversation, Message } from '@/types/chat'
import { runTests } from './test-chat'

const API_BASE_URL = 'http://localhost:3000/api/chat'

// Default fetch options with CORS credentials
const defaultFetchOptions: RequestInit = {
  credentials: 'include', // Include cookies for cross-origin requests
  headers: {
    'Content-Type': 'application/json',
    accept: 'application/json',
  },
}

// Execute the tests
//runTests().catch(console.error)

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
  try {
    console.log(`Streaming completion for conversation: ${conversationId}`)
    const url = `${API_BASE_URL}/conversations/${conversationId}/completions`

    console.log(`Fetching from URL: ${url}`)
    const response = await fetch(url, {
      ...defaultFetchOptions,
      method: 'POST',
      headers: {
        ...defaultFetchOptions.headers,
        accept: 'text/event-stream',
      },
      body: JSON.stringify({ message }),
    })
    if (!response.body) {
      throw new Error('Response body is not readable')
    }
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      console.log('Received', value)
    }
  } catch (error) {
    console.error('Streaming error:', error)
    throw error
  }
}

// Streaming Completion
export async function streamCompletion_bak(
  conversationId: string,
  message: string,
  onChunk: (chunk: { id: string; content: string; done: boolean }) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    console.log(`Streaming completion for conversation: ${conversationId}`)
    const url = `${API_BASE_URL}/conversations/${conversationId}/completions`
    console.log(`Fetching from URL: ${url}`)

    const response = await fetch(url, {
      ...defaultFetchOptions,
      method: 'POST',
      headers: {
        ...defaultFetchOptions.headers,
        accept: 'text/event-stream',
      },
      body: JSON.stringify({ message }),
      signal,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Stream error: ${response.status} ${errorText}`)
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

      // Process complete SSE events (separated by double newlines)
      const events = buffer.split('\n\n')
      // Keep the last part in the buffer if it's incomplete
      buffer = events.pop() || ''

      for (const event of events) {
        const trimmedEvent = event.trim()
        if (trimmedEvent.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmedEvent.slice(6))
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

    // Process any remaining data in the buffer
    if (buffer.trim() && buffer.trim().startsWith('data: ')) {
      try {
        const data = JSON.parse(buffer.trim().slice(6))
        onChunk(data)
      } catch (e) {
        console.error('Error parsing final SSE data:', e)
      }
    }
  } catch (error) {
    console.error('Streaming error:', error)
    throw error
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
