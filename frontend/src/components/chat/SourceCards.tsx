import { motion } from 'framer-motion'
import { ExternalLink, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getScoreColor } from '@/lib/utils'
import type { Source } from '@/types'

interface SourceCardsProps {
  sources: Source[]
}

export function SourceCards({ sources }: SourceCardsProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold mb-2">📚 Sources</h4>
      {sources.map((source, index) => (
        <motion.div
          key={source.arxiv_id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-card border rounded-lg p-3 hover:border-primary/50 transition-colors group"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h5 className="font-medium text-sm leading-tight mb-1 group-hover:text-primary transition-colors">
                {source.title}
              </h5>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span className="truncate">{source.authors}</span>
              </div>
            </div>
            <Badge variant="secondary" className={getScoreColor(source.score)}>
              {(source.score * 100).toFixed(0)}%
            </Badge>
          </div>
          <a
            href={`https://arxiv.org/abs/${source.arxiv_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            View on arXiv
          </a>
        </motion.div>
      ))}
    </div>
  )
}
