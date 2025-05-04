'use client'

import type React from 'react'

import { useState, useRef } from 'react'
import type { Message } from '@/types/chat'
import { Button } from '@workspace/ui/components/button'
import { Textarea } from '@workspace/ui/components/textarea'
import { SendIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { sendMessage, streamCompletion } from '@/lib/api'

interface MessageInputProps {
  conversationId: string
  onMessageSent: (messages: Message[]) => void
}

export default function MessageInput({ conversationId, onMessageSent }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const assistantMessageRef = useRef<Message | null>(null)
  const userMessageRef = useRef<Message | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || isLoading) return

    try {
      setIsLoading(true)

      // Send user message
      const userMessage = await sendMessage(conversationId, message, 'user')
      userMessageRef.current = userMessage

      // Update UI with user message
      onMessageSent([userMessage])

      // Clear input
      setMessage('')

      // Stream AI response
      const controller = new AbortController()
      const signal = controller.signal

      // Create a temporary placeholder message for the assistant
      const tempAssistantMessage: Message = {
        id: 'temp-' + Date.now(),
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      }

      // Add empty assistant message to UI
      assistantMessageRef.current = tempAssistantMessage
      onMessageSent([userMessage, tempAssistantMessage])

      // Start streaming
      await streamCompletion(
        conversationId,
        message,
        chunk => {
          if (assistantMessageRef.current) {
            // Set the real message ID from the server once we receive it
            const currentContent = assistantMessageRef.current.content

            // Update assistant message with new content and proper ID
            const updatedMessage = {
              ...assistantMessageRef.current,
              id: chunk.id, // Always use the ID from the server
              content: currentContent + chunk.content,
            }

            // Store the updated message in the ref
            assistantMessageRef.current = updatedMessage

            // Update UI with current user message and updated assistant message
            if (userMessageRef.current) {
              onMessageSent([userMessageRef.current, updatedMessage])
            }

            // If this is the final chunk, log completion
            if (chunk.done) {
              console.log('Streaming completed for chunk:', chunk)
            }
          }
        },
        signal
      )
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: 'Error',
          description: `Failed to send message: ${error.message}`,
          variant: 'destructive',
        })
        console.error('Message error:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="min-h-[60px] resize-none"
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading || !message.trim()}>
          <SendIcon size={18} />
        </Button>
      </form>
    </div>
  )
}
