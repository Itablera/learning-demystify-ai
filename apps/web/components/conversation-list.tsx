'use client'

import type { Conversation } from '@/types/chat'
import { TrashIcon } from 'lucide-react'
import { Skeleton } from '@workspace/ui/components/skeleton'

interface ConversationListProps {
  conversations: Conversation[]
  currentId: string | undefined
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  loading: boolean
}

export default function ConversationList({
  conversations,
  currentId,
  onSelect,
  onDelete,
  loading,
}: ConversationListProps) {
  if (loading && conversations.length === 0) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-2">
      {conversations.length === 0 ? (
        <div className="text-center p-4 text-muted-foreground">No conversations yet</div>
      ) : (
        <ul className="space-y-2">
          {conversations.map(conversation => (
            <li key={conversation.id} className="relative group">
              <button
                onClick={() => onSelect(conversation.id)}
                className={`w-full text-left p-3 rounded-md hover:bg-accent transition-colors ${
                  currentId === conversation.id ? 'bg-accent' : ''
                }`}
              >
                <div className="truncate pr-8">{conversation.title}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {new Date(conversation.updatedAt).toLocaleString()}
                </div>
              </button>
              <button
                onClick={e => {
                  e.stopPropagation()
                  onDelete(conversation.id)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive hover:text-destructive-foreground rounded-sm transition-opacity"
                aria-label="Delete conversation"
              >
                <TrashIcon size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
