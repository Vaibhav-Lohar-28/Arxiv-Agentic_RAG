import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash2, MessageSquare, X } from 'lucide-react'
import type { Conversation } from '@/types'
import { cn } from '@/lib/utils'

interface ChatSidebarProps {
  conversations: Conversation[]
  currentId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  isOpen: boolean
  onClose: () => void
}

export function ChatSidebar({
  conversations,
  currentId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const formatDate = (date: Date) => {
    const now = new Date()
    const conversationDate = new Date(date)
    const diffDays = Math.floor((now.getTime() - conversationDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return conversationDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return conversationDate.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return conversationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
          
          {/* Sidebar */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed lg:static inset-y-0 left-0 z-50 w-[280px]',
              'bg-card border-r flex flex-col',
              'lg:translate-x-0'
            )}
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Chat History
              </h2>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNew}
                  title="New Chat"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="lg:hidden"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* New Chat Button */}
            <div className="p-3">
              <Button
                onClick={onNew}
                className="w-full justify-start gap-2"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </Button>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1 px-3">
              <div className="space-y-1 pb-4">
                {conversations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No conversations yet
                  </p>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={cn(
                        'group flex items-center gap-2 p-3 rounded-lg cursor-pointer',
                        'hover:bg-accent transition-colors',
                        currentId === conversation.id && 'bg-accent'
                      )}
                      onClick={() => onSelect(conversation.id)}
                    >
                      <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {conversation.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(conversation.updatedAt)} • {conversation.messages.length} messages
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(conversation.id)
                        }}
                      >
                        <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t text-xs text-muted-foreground text-center">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
