import { Sun, Moon, Settings, Github, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  isDarkMode: boolean
  onToggleTheme: () => void
  onOpenSettings: () => void
  children?: React.ReactNode
}

export function Header({ isDarkMode, onToggleTheme, onOpenSettings, children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          {children}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg hidden sm:inline">
            Arxiv <span className="text-gradient">RAG</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="h-9 w-9"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            className="h-9 w-9"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center justify-center rounded-md text-sm font-medium",
              "h-9 w-9 hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  )
}
