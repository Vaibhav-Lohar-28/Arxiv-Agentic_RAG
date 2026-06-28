import { motion } from 'framer-motion'
import { getStepEmoji } from '@/lib/utils'

interface ReasoningStepsProps {
  steps: string[]
}

export function ReasoningSteps({ steps }: ReasoningStepsProps) {
  return (
    <div className="bg-muted/50 rounded-lg p-4 border">
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <span>🔍</span> Reasoning Process
      </h4>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 text-sm"
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
              {index + 1}
            </span>
            <span className="pt-0.5">
              <span className="mr-1">{getStepEmoji(step)}</span>
              {step}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
