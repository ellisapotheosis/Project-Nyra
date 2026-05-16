'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Command, Zap, Users, LayoutDashboard,
  X, ShieldCheck, Cpu, Network, Brain, Bot,
  Box, History, Settings, ChevronRight,
  Terminal, Database, Workflow, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

export type CommandCategory = 'navigation' | 'leads' | 'skills' | 'system' | 'ops';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  category: CommandCategory;
  icon: React.ReactNode;
  onSelect: () => void | Promise<void>;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Helper function for fuzzy search
function fuzzyMatch(query: string, text: string): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  if (!queryLower) return 1;
  if (textLower.includes(queryLower)) return 100;

  let score = 0;
  let queryIdx = 0;
  let textIdx = 0;

  while (queryIdx < queryLower.length && textIdx < textLower.length) {
    if (queryLower[queryIdx] === textLower[textIdx]) {
      score += 10;
      queryIdx++;
    }
    textIdx++;
  }

  return queryIdx === queryLower.length ? score : 0;
}

function searchItems(query: string, items: CommandItem[]): CommandItem[] {
  if (!query) return items;

  return items
    .map(item => ({
      item,
      score: Math.max(
        fuzzyMatch(query, item.label),
        fuzzyMatch(query, item.description || ''),
        ...(item.keywords || []).map(kw => fuzzyMatch(query, kw))
      ),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

export function CommandPalette({ isOpen = false, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(isOpen);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Synchronize with external prop
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery('');
    setSelectedIndex(0);
    onOpenChange?.(false);
  }, [onOpenChange]);

  // Navigation commands
  const navigationCommands: CommandItem[] = [
    {
      id: 'nav-dashboard',
      label: 'Mission Overview',
      description: 'Go to primary control surface',
      category: 'navigation',
      icon: <LayoutDashboard size={16} />,
      keywords: ['home', 'overview', 'main', 'cockpit'],
      onSelect: () => {
        router.push('/');
        handleClose();
      },
    },
    {
      id: 'nav-leads',
      label: 'Lead Registry',
      description: 'Manage mortgage lead ingestion',
      category: 'navigation',
      icon: <Users size={16} />,
      keywords: ['leads', 'contacts', 'customers', 'queue'],
      onSelect: () => {
        router.push('/leads');
        handleClose();
      },
    },
    {
      id: 'nav-pipeline',
      label: 'Pipeline Board',
      description: 'Kanban lifecycle visualization',
      category: 'navigation',
      icon: <Workflow size={16} />,
      keywords: ['deals', 'kanban', 'stages', 'funding'],
      onSelect: () => {
        router.push('/pipeline');
        handleClose();
      },
    },
    {
      id: 'nav-quotes',
      label: 'Quotes Desk',
      description: 'Deterministic mortgage pricing',
      category: 'navigation',
      icon: <Box size={16} />,
      keywords: ['mortgage', 'rates', 'offers', 'pricing'],
      onSelect: () => {
        router.push('/quotes');
        handleClose();
      },
    },
    {
      id: 'nav-assistant',
      label: 'AI Assistant',
      description: 'Direct Nyra orchestration terminal',
      category: 'ops',
      icon: <Bot size={16} />,
      keywords: ['agent', 'ai', 'assistant', 'chat'],
      onSelect: () => {
        router.push('/assistant');
        handleClose();
      },
    },
    {
      id: 'nav-fleet',
      label: 'Fleet Control',
      description: 'Global cluster telemetry',
      category: 'system',
      icon: <Cpu size={16} />,
      keywords: ['gpu', 'compute', 'nodes', 'workers'],
      onSelect: () => {
        router.push('/fleet');
        handleClose();
      },
    },
    {
      id: 'nav-memory',
      label: 'Mempalace',
      description: 'Holographic cognitive graph',
      category: 'system',
      icon: <Brain size={16} />,
      keywords: ['storage', 'retrieval', 'knowledge', 'graph'],
      onSelect: () => {
        router.push('/memory');
        handleClose();
      },
    },
    {
      id: 'nav-logs',
      label: 'Audit Trail',
      description: 'System forensics and trace logs',
      category: 'ops',
      icon: <History size={16} />,
      keywords: ['logs', 'forensics', 'audit', 'compliance'],
      onSelect: () => {
        router.push('/logs');
        handleClose();
      },
    },
    {
      id: 'nav-settings',
      label: 'System Settings',
      description: 'Global registry configuration',
      category: 'ops',
      icon: <Settings size={16} />,
      keywords: ['config', 'admin', 'integrations', 'secrets'],
      onSelect: () => {
        router.push('/settings');
        handleClose();
      },
    },
  ];

  // System actions
  const systemCommands: CommandItem[] = [
    {
      id: 'sys-reindex',
      label: 'RE_INDEX_REGISTRY',
      description: 'Force CRM metadata refresh',
      category: 'system',
      icon: <Database size={16} />,
      keywords: ['sync', 'crm', 'twenty'],
      onSelect: () => {
        console.log('Re-indexing registry...');
        handleClose();
      },
    },
    {
      id: 'sys-calibration',
      label: 'CALIBRATE_NODE_MESH',
      description: 'Optimize cluster load balancing',
      category: 'system',
      icon: <Network size={16} />,
      keywords: ['optimize', 'fleet', 'mesh'],
      onSelect: () => {
        console.log('Calibrating mesh...');
        handleClose();
      },
    },
  ];

  const allCommands = [...navigationCommands, ...systemCommands];
  const filteredCommands = searchItems(query, allCommands);

  const handleSelectItem = useCallback(async (item: CommandItem) => {
    await item.onSelect();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!open) {
          onOpenChange?.(true);
        } else {
          handleClose();
        }
      }

      if (!open) return;

      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            handleSelectItem(filteredCommands[selectedIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, filteredCommands, handleClose, handleSelectItem, onOpenChange]);

  // Auto-focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [open]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const items = listRef.current.querySelectorAll('[data-command-item]');
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!open) return null;

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<CommandCategory, CommandItem[]>);

  const categoryLabels: Record<CommandCategory, string> = {
    navigation: 'Protocol_Access',
    leads: 'Lead_Metrics',
    skills: 'Skill_Execution',
    system: 'Cluster_Kernel',
    ops: 'Operations_Control',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Command Palette */}
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[200] w-full max-w-2xl px-6">
        <div className="bg-card/90 backdrop-blur-2xl border border-indigo-500/30 rounded-[32px] shadow-[0_0_100px_-20px_rgba(99,102,241,0.4)] overflow-hidden border-t-2 border-t-indigo-500 animate-in slide-in-from-top-4 zoom-in-95 duration-500">
          {/* Input Area */}
          <div className="flex items-center gap-4 px-8 py-6 border-b border-border/40 bg-indigo-500/5">
            <Search className="text-indigo-400" size={24} />
            <input
              ref={inputRef}
              type="text"
              placeholder="INITIATE_COMMAND_BUFFER..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/30 outline-none text-xl font-black uppercase tracking-tighter italic"
            />
            <button
              onClick={handleClose}
              className="size-10 rounded-full border border-border/40 flex items-center justify-center text-muted-foreground hover:text-pink-400 transition-colors bg-background/60 shadow-inner"
            >
              <X size={18} />
            </button>
          </div>

          {/* Results Area */}
          <div
            ref={listRef}
            className="max-h-[400px] overflow-y-auto p-2 scrollbar-hide"
          >
            {filteredCommands.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-center opacity-20">
                <Search size={48} className="text-indigo-400" />
                <p className="font-black uppercase tracking-[0.5em] text-sm">NO_PROTOCOL_MATCH</p>
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, items]) => (
                <div key={category} className="mb-4">
                  <div className="px-6 py-3 text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400/60 sticky top-0 bg-transparent z-10">
                    {categoryLabels[category as CommandCategory]}
                  </div>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const globalIdx = filteredCommands.indexOf(item);
                      const isSelected = globalIdx === selectedIndex;

                      return (
                        <button
                          key={item.id}
                          data-command-item
                          onClick={() => handleSelectItem(item)}
                          className={cn(
                            'w-full flex items-center gap-5 px-6 py-4 text-left transition-all rounded-2xl border-2 group',
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-xl shadow-indigo-500/20 translate-x-1'
                              : 'hover:bg-indigo-500/5 text-foreground border-transparent hover:border-indigo-500/10'
                          )}
                        >
                          <div className={cn("size-10 rounded-xl flex items-center justify-center border transition-colors shadow-inner",
                            isSelected ? "bg-white/20 border-white/20" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 group-hover:text-indigo-300"
                          )}>
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-black uppercase tracking-tight text-sm italic">{item.label}</div>
                            {item.description && (
                              <div className={cn("text-[10px] font-bold uppercase tracking-widest opacity-60 truncate mt-0.5", isSelected ? "text-white/70" : "text-muted-foreground")}>
                                {item.description}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                             <div className="flex items-center gap-3">
                               <Badge className="bg-white/20 text-white border-none text-[8px] font-black">EXECUTE</Badge>
                               <ChevronRight size={14} className="opacity-40 animate-pulse" />
                             </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Terminal Guide */}
          <div className="px-8 py-4 bg-background/60 border-t border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded bg-muted border border-border/60">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded bg-muted border border-border/60">⏎</kbd>
                <span>Execute</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded bg-muted border border-border/60">Esc</kbd>
                <span>Exit</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <div className="size-1.5 rounded-full bg-turquoise-500 animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-widest text-turquoise-400">Terminal_Online</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
