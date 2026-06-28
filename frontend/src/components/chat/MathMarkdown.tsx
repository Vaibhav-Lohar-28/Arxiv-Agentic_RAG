// Simple text renderer that converts LaTeX math to Unicode
import { cn } from '@/lib/utils'


interface MathMarkdownProps {
  content: string
  className?: string
  isUser?: boolean
}

// Convert LaTeX to readable Unicode text
function convertMath(text: string): string {
  let result = text

  // Replace display math $$...$$
  result = result.replace(/\$\$\s*([^$]+?)\s*\$\$/g, (_, math) => {
    return '\n' + convertLatexCommands(math) + '\n'
  })

  // Replace inline math $...$
  result = result.replace(/\$([^$]+)\$/g, (_, math) => {
    return convertLatexCommands(math)
  })

  // Replace any remaining standalone commands
  result = convertLatexCommands(result)

  // Clean up
  result = result.replace(/\n{3,}/g, '\n\n')
  result = result.replace(/  +/g, ' ')

  return result
}

function convertLatexCommands(text: string): string {
  let result = text

  const map: Record<string, string> = {
    '\\\\alpha': 'α',
    '\\\\beta': 'β',
    '\\\\gamma': 'γ',
    '\\\\delta': 'δ',
    '\\\\epsilon': 'ε',
    '\\\\theta': 'θ',
    '\\\\lambda': 'λ',
    '\\\\mu': 'μ',
    '\\\\sigma': 'σ',
    '\\\\phi': 'φ',
    '\\\\psi': 'ψ',
    '\\\\omega': 'ω',
    '\\\\Gamma': 'Γ',
    '\\\\Delta': 'Δ',
    '\\\\Sigma': 'Σ',
    '\\\\Phi': 'Φ',
    '\\\\Psi': 'Ψ',
    '\\\\Omega': 'Ω',
  }

  for (const [latex, unicode] of Object.entries(map)) {
    const regex = new RegExp(
      latex.replace(/\\\\/g, '\\\\\\\\') + '(?![a-zA-Z])',
      'g'
    )
    result = result.replace(regex, unicode)
  }

  result = result.replace(/\\\\(frac|dfrac)\{([^}]+)\}\{([^}]+)\}/g, '($2/$3)')
  result = result.replace(/\\\\(text|mathbf)\{([^}]+)\}/g, '$2')
  result = result.replace(/\\\\(sqrt)\{([^}]+)\}/g, '√$2')
  result = result.replace(/\\\\(left|right)/g, '')
  result = result.replace(/[{}]/g, '')
  result = result.replace(/\\\\/g, '')

  return result
}

export function MathMarkdown({ content, className, isUser }: MathMarkdownProps) {
  const processed = convertMath(content)

  return (
    <div className={cn(
      'text-sm leading-relaxed whitespace-pre-wrap',
      isUser ? 'text-white' : 'text-gray-900 dark:text-gray-100',
      className
    )}>
      {processed}
    </div>
  )
}
