import { X, Sliders } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { AVAILABLE_MODELS, ARXIV_CATEGORIES, type Settings } from '@/types'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  settings: Settings
  onSettingsChange: (settings: Settings) => void
}

export function SettingsPanel({ isOpen, onClose, settings, onSettingsChange }: SettingsPanelProps) {
  const toggleCategory = (category: string) => {
    const newCategories = settings.categories.includes(category)
      ? settings.categories.filter((c) => c !== category)
      : [...settings.categories, category]
    onSettingsChange({ ...settings, categories: newCategories })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-2xl z-50"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5" />
                  <h2 className="font-semibold">Settings</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <ScrollArea className="flex-1 p-4">
                {/* Model Selection */}
                <div className="space-y-3 mb-6">
                  <label className="text-sm font-medium">Model</label>
                  <Select
                    value={settings.model}
                    onValueChange={(value) => onSettingsChange({ ...settings, model: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          <div className="flex flex-col">
                            <span>{model.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {model.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="my-4" />

                {/* Top K Slider */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Top K Chunks</label>
                    <span className="text-sm text-muted-foreground">{settings.top_k}</span>
                  </div>
                  <Slider
                    value={[settings.top_k]}
                    onValueChange={([value]) => onSettingsChange({ ...settings, top_k: value })}
                    min={1}
                    max={10}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of document chunks to retrieve. Higher values provide more context but may slow down response.
                  </p>
                </div>

                <Separator className="my-4" />

                {/* Hybrid Search Toggle */}
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Hybrid Search</label>
                    <p className="text-xs text-muted-foreground">
                      Combine BM25 + vector embeddings
                    </p>
                  </div>
                  <Switch
                    checked={settings.use_hybrid}
                    onCheckedChange={(checked) =>
                      onSettingsChange({ ...settings, use_hybrid: checked })
                    }
                  />
                </div>

                <Separator className="my-4" />

                {/* Categories */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">arXiv Categories</label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Leave empty to search all categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ARXIV_CATEGORIES.map((category) => {
                      const isSelected = settings.categories.includes(category.value)
                      return (
                        <button
                          key={category.value}
                          onClick={() => toggleCategory(category.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}
                          title={category.description}
                        >
                          {category.value}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="p-4 border-t bg-muted/50">
                <Button variant="outline" className="w-full" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
