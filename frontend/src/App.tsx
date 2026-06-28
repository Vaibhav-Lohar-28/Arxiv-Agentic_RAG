import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Header } from '@/components/layout/Header'
import { SettingsPanel } from '@/components/layout/SettingsPanel'
import { ChatSidebar } from '@/components/layout/ChatSidebar'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatInput } from '@/components/chat/ChatInput'
import { WelcomeScreen } from '@/components/chat/WelcomeScreen'
import { askAgentic } from '@/api/client'
import type { ChatMessage as ChatMessageType, Settings, Conversation } from '@/types'
import { generateId } from '@/lib/utils'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

const DEFAULT_SETTINGS: Settings = {
  top_k: 5,
  use_hybrid: true,
  model: 'llama3.2:1b',
  categories: [],
}

// Load conversations from localStorage
const loadConversations = (): Conversation[] => {
  if (typeof window === 'undefined') return []
  const saved = localStorage.getItem('conversations')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      return parsed.map((c: Conversation) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
        messages: c.messages.map((m: ChatMessageType) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
      }))
    } catch {
      return []
    }
  }
  return []
}

// Save conversations to localStorage
const saveConversations = (conversations: Conversation[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('conversations', JSON.stringify(conversations))
}

function App() {
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Save conversations when they change
  useEffect(() => {
    saveConversations(conversations)
  }, [conversations])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Create new conversation
  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setConversations((prev) => [newConversation, ...prev])
    setCurrentConversationId(newConversation.id)
    setMessages([])
  }, [])

  // Load conversation
  const loadConversation = useCallback((id: string) => {
    const conversation = conversations.find((c) => c.id === id)
    if (conversation) {
      setCurrentConversationId(id)
      setMessages(conversation.messages)
    }
  }, [conversations])

  // Delete conversation
  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (currentConversationId === id) {
      setCurrentConversationId(null)
      setMessages([])
    }
  }, [currentConversationId])

  // Update conversation title based on first message
  const updateConversationTitle = useCallback((id: string, firstMessage: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              title: firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : ''),
              updatedAt: new Date(),
            }
          : c
      )
    )
  }, [])

  // Handle sending message (NON-STREAMING - stable version)
  const handleSendMessage = async (content: string) => {
    // Create conversation if needed
    let conversationId = currentConversationId
    if (!conversationId) {
      const newConversation: Conversation = {
        id: generateId(),
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      conversationId = newConversation.id
      setConversations((prev) => [newConversation, ...prev])
      setCurrentConversationId(conversationId)
    }

    // Add user message
    const userMessage: ChatMessageType = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Update title if first message
    if (messages.length === 0) {
      updateConversationTitle(conversationId, content)
    }

    // Show loading state
    setIsLoading(true)

    try {
      // Call API
      const response = await askAgentic({
        query: content,
        top_k: settings.top_k,
        use_hybrid: settings.use_hybrid,
        model: settings.model,
        categories: settings.categories.length > 0 ? settings.categories : undefined,
      })

      // Add assistant message
      const assistantMessage: ChatMessageType = {
        id: generateId(),
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        reasoning_steps: response.reasoning_steps,
        trace_id: response.trace_id,
        execution_time: response.execution_time,
        guardrail_score: response.guardrail_score,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      
      // Update conversation
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: [...c.messages, userMessage, assistantMessage],
                updatedAt: new Date(),
              }
            : c
        )
      )
    } catch (error) {
      console.error('Error:', error)
      
      // Add error message
      const errorMessage: ChatMessageType = {
        id: generateId(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        currentId={currentConversationId}
        onSelect={loadConversation}
        onNew={createNewConversation}
        onDelete={deleteConversation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="mr-2"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </Header>

        <main className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 px-4">
            <div className="max-w-3xl mx-auto py-6 space-y-6">
              {!hasMessages && !isLoading ? (
                <WelcomeScreen onExampleClick={handleSendMessage} />
              ) : (
                <>
                  <AnimatePresence mode="popLayout">
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ChatMessage message={message} />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Loading indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 text-muted-foreground p-4"
                    >
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100" />
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200" />
                      </div>
                      <span className="text-sm">Thinking...</span>
                    </motion.div>
                  )}

                  <div ref={scrollRef} />
                </>
              )}
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="border-t bg-background p-4">
            <div className="max-w-3xl mx-auto">
              <ChatInput
                onSend={handleSendMessage}
                isLoading={isLoading}
              />
            </div>
          </div>
        </main>

        {/* Settings Panel */}
        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSettingsChange={setSettings}
        />
      </div>
    </div>
  )
}

export default App
