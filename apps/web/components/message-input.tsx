'use client'

import type React from 'react'

import { useState } from 'react'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || isLoading) return

    try {
      setIsLoading(true)

      // Send user message
      const userMessage = await sendMessage(conversationId, message, 'user')

      // Update UI with user message
      onMessageSent([userMessage])

      // Clear input
      setMessage('')

      // Stream AI response
      const controller = new AbortController()
      const signal = controller.signal

      let assistantMessage: Message = {
        id: 'temp-' + Date.now(),
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      }

      // Add empty assistant message to UI
      onMessageSent([userMessage, assistantMessage])

      // Start streaming
      await streamCompletion(
        conversationId,
        message,
        chunk => {
          // Update assistant message content as chunks arrive
          assistantMessage = {
            ...assistantMessage,
            content: assistantMessage.content + chunk.content,
            id: chunk.done ? chunk.id : assistantMessage.id,
          }

          // Update UI with current state of assistant message
          onMessageSent([userMessage, assistantMessage])
        },
        signal
      )
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: 'Error',
          description: 'Failed to send message',
          variant: 'destructive',
        })
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
