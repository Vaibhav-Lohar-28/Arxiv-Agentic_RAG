import { motion } from 'framer-motion'
import { User, Bot, ThumbsUp, ThumbsDown, Clock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn, getScoreColor } from '@/lib/utils'
import { SourceCards } from './SourceCards'
import { ReasoningSteps } from './ReasoningSteps'
import { MathMarkdown } from './MathMarkdown'
import type { ChatMessage as ChatMessageType } from '@/types'
import { submitFeedback } from '@/api/client'
import { useState } from 'react'
interface ChatMessageProps {
  message: ChatMessageType
}

// Safe wrapper for MathMarkdown with error handling
function SafeMathMarkdown({ content, isUser }: { content: string; isUser: boolean }) {
  const [hasError, setHasError] = useState(false)
  
  if (hasError) {
    return (
      <div className={cn('prose max-w-none', isUser && 'prose-invert')}>
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    )
  }
  
  try {
    return <MathMarkdown content={content} isUser={isUser} />
  } catch (error) {
    console.error('Math rendering error:', error)
    setHasError(true)
    return (
      <div className={cn('prose max-w-none', isUser && 'prose-invert')}>
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    )
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)
  const [showSources, setShowSources] = useState(false)
  const [showReasoning, setShowReasoning] = useState(false)

  const isUser = message.role === 'user'
  
  // Detect if message contains LaTeX math
 
  const handleFeedback = async (type: 'up' | 'down') => {
    if (!message.trace_id || feedback) return
    
    setFeedback(type)
    await submitFeedback({
      trace_id: message.trace_id,
      score: type === 'up' ? 1 : 0,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-4 p-4 rounded-2xl',
        isUser ? 'bg-primary text-primary-foreground ml-auto max-w-[85%]' : 'bg-card border shadow-sm w-full'
      )}
    >
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser ? 'bg-primary-foreground/20' : 'bg-primary/10'
      )}>
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-primary" />}
      </div>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold">
            {isUser ? 'You' : 'Arxiv Agent'}
          </span>
          {!isUser && message.guardrail_score && (
            <Badge variant="outline" className={cn('text-xs', getScoreColor(message.guardrail_score / 100))}>
              <Shield className="w-3 h-3 mr-1" />
              {message.guardrail_score.toFixed(0)}%
            </Badge>
          )}
        </div>

        {/* Content - Math-enabled markdown rendering */}
        <SafeMathMarkdown content={message.content} isUser={isUser} />
        
       

        {/* Footer with actions */}
        {!isUser && (
          <>
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {message.execution_time && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {message.execution_time.toFixed(1)}s
                  </span>
                )}
                
                {message.sources && message.sources.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSources(!showSources)}
                    className="text-xs h-7"
                  >
                    📚 {message.sources.length} sources
                  </Button>
                )}
                
                {message.reasoning_steps && message.reasoning_steps.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReasoning(!showReasoning)}
                    className="text-xs h-7"
                  >
                    🔍 Reasoning
                  </Button>
                )}
              </div>

              {message.trace_id && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn('h-7 w-7', feedback === 'up' && 'bg-green-100 text-green-600')}
                    onClick={() => handleFeedback('up')}
                    disabled={!!feedback}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn('h-7 w-7', feedback === 'down' && 'bg-red-100 text-red-600')}
                    onClick={() => handleFeedback('down')}
                    disabled={!!feedback}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Expanded sections */}
            {showReasoning && message.reasoning_steps && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3"
              >
                <ReasoningSteps steps={message.reasoning_steps} />
              </motion.div>
            )}

            {showSources && message.sources && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3"
              >
                <SourceCards sources={message.sources} />
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
