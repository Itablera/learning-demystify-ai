'use client'

import { useState, useEffect } from 'react'
import type { Conversation, Message } from '@/types/chat'
import ConversationList from './conversation-list'
import MessageDisplay from './message-display'
import MessageInput from './message-input'
import { Button } from '@workspace/ui/components/button'
import { PlusIcon, MenuIcon, XIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useMobile } from '@/hooks/use-mobile'
import {
  createConversation,
  getConversations,
  getConversation,
  deleteConversation,
} from '@/lib/api'

export default function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useMobile()
  const { toast } = useToast()

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const data = await getConversations()
      setConversations(data)
      if (data.length > 0 && !currentConversation && data[0]) {
        await selectConversation(data[0].id)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const selectConversation = async (id: string) => {
    try {
      setLoading(true)
      const conversation = await getConversation(id)
      setCurrentConversation(conversation)
      if (isMobile) {
        setSidebarOpen(false)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load conversation',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNewConversation = async () => {
    try {
      setLoading(true)
      const title = `New Conversation ${new Date().toLocaleString()}`
      const newConversation = await createConversation(title)
      setConversations([newConversation, ...conversations])
      setCurrentConversation(newConversation)
      if (isMobile) {
        setSidebarOpen(false)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create new conversation',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id)
      setConversations(conversations.filter(conv => conv.id !== id))
      if (currentConversation?.id === id) {
        setCurrentConversation(
          conversations.length > 1 ? conversations.find(conv => conv.id !== id) || null : null
        )
      }
      toast({
        title: 'Success',
        description: 'Conversation deleted',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete conversation',
        variant: 'destructive',
      })
    }
  }

  const updateConversationMessages = (messages: Message[]) => {
    if (currentConversation) {
      setCurrentConversation({
        ...currentConversation,
        messages,
      })
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar toggle */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 p-2 bg-background rounded-md shadow-md"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 z-40 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`
            : 'w-64 border-r'
        } bg-background`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Button onClick={handleNewConversation} className="w-full" disabled={loading}>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Conversation
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              currentId={currentConversation?.id}
              onSelect={selectConversation}
              onDelete={handleDeleteConversation}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col ${isMobile && sidebarOpen ? 'opacity-50' : ''}`}>
        {currentConversation ? (
          <>
            <MessageDisplay
              conversation={currentConversation}
              loading={loading}
              updateMessages={updateConversationMessages}
            />
            <MessageInput
              conversationId={currentConversation.id}
              onMessageSent={messages => updateConversationMessages(messages)}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Welcome to AI Chat</h2>
              <p className="mb-6 text-muted-foreground">
                Start a new conversation to begin chatting with the AI
              </p>
              <Button onClick={handleNewConversation} disabled={loading}>
                <PlusIcon className="mr-2 h-4 w-4" />
                New Conversation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
