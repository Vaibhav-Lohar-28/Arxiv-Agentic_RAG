import { motion } from 'framer-motion'
import { Sparkles, BookOpen, Search, MessageSquare } from 'lucide-react'


interface WelcomeScreenProps {
  onExampleClick: (query: string) => void
}

const EXAMPLE_QUERIES = [
  'What are transformers in machine learning?',
  'Explain the attention mechanism in detail',
  'What are the latest developments in multimodal LLMs?',
  'Compare different RAG implementations and their benchmarks',
  'How do convolutional neural networks work?',
  'What is the state of the art in text-to-image generation?',
]

const FEATURES = [
  {
    icon: Search,
    title: 'Hybrid Search',
    description: 'Combines BM25 + vector embeddings for best results',
  },
  {
    icon: Sparkles,
    title: 'Agentic RAG',
    description: 'Intelligent agent that reasons and validates answers',
  },
  {
    icon: BookOpen,
    title: 'Cited Sources',
    description: 'Every answer includes links to arXiv papers',
  },
  {
    icon: MessageSquare,
    title: 'Natural Conversation',
    description: 'Ask follow-up questions naturally',
  },
]

export function WelcomeScreen({ onExampleClick }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-gradient">Arxiv Agentic RAG</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Your intelligent research assistant powered by Agentic RAG.
          Ask questions about AI/ML papers and get cited answers.
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 w-full max-w-3xl"
      >
        {FEATURES.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="flex flex-col items-center text-center p-4 rounded-xl bg-card border hover:border-primary/50 transition-colors"
          >
            <feature.icon className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-medium text-sm">{feature.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Example Queries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-2xl"
      >
        <p className="text-sm text-muted-foreground text-center mb-4">
          Try asking:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLE_QUERIES.map((query, index) => (
            <motion.button
              key={query}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              onClick={() => onExampleClick(query)}
              className="px-4 py-2 text-sm rounded-full bg-secondary hover:bg-secondary/80 transition-colors text-left"
            >
              {query}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
