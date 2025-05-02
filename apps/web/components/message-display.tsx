'use client'

import { useEffect, useRef } from 'react'
import type { Conversation, Message } from '@/types/chat'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { getConversationMessages } from '@/lib/api'

interface MessageDisplayProps {
  conversation: Conversation
  loading: boolean
  updateMessages: (messages: Message[]) => void
}

export default function MessageDisplay({
  conversation,
  loading,
  updateMessages,
}: MessageDisplayProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [conversation.messages])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messages = await getConversationMessages(conversation.id)
        updateMessages(messages)
      } catch (error) {
        console.error('Failed to fetch messages:', error)
      }
    }

    if (conversation.id && conversation.messages.length === 0) {
      fetchMessages()
    }
  }, [conversation.id])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {conversation.messages.length === 0 && !loading ? (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <>
          {conversation.messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="space-y-2 max-w-[80%]">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          )}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8">
        <AvatarFallback>{isUser ? 'U' : 'AI'}</AvatarFallback>
        {!isUser && <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI" />}
      </Avatar>
      <div
        className={`rounded-lg p-3 max-w-[80%] ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
      >
        <div className="text-sm mb-1 font-medium">{isUser ? 'You' : 'Assistant'}</div>
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  )
}
