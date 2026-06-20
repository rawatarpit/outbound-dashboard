import { useState } from 'react'
import { Search, Mail, Star, MessageSquare, Filter, ChevronLeft, Inbox, Send, Reply, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { cn, formatRelativeTime } from '@/lib/utils'

interface Thread {
  id: string
  sender: string
  title: string
  company: string
  preview: string
  timestamp: string
  is_unread: boolean
  is_starred: boolean
  status: 'inbox' | 'unread' | 'starred' | 'replied' | 'bounced'
}

const sampleThreads: Thread[] = [
  { id: '1', sender: 'John (CTO)', title: 'Re: Quick question about your sales stack', company: 'Acme Corp', preview: 'Hi, thanks for reaching out. We are actually evaluating solutions right now. Can you share a demo?', timestamp: new Date().toISOString(), is_unread: true, is_starred: false, status: 'inbox' },
  { id: '2', sender: 'Sarah (VP Eng)', title: 'Re: Following up on my note', company: 'Beta Inc', preview: 'Sorry for the delay. Not interested at this time.', timestamp: new Date(Date.now() - 7200000).toISOString(), is_unread: true, is_starred: false, status: 'inbox' },
  { id: '3', sender: 'Mike (CEO)', title: 'Re: Loved your post about outbound', company: 'Gamma LLC', preview: 'Hey! Would love to chat. Are you free next Tuesday?', timestamp: new Date(Date.now() - 86400000).toISOString(), is_unread: false, is_starred: true, status: 'starred' },
  { id: '4', sender: 'No Subject', title: '(No subject)', company: 'Delta Ltd', preview: 'Unsubscribed', timestamp: new Date(Date.now() - 259200000).toISOString(), is_unread: false, is_starred: false, status: 'bounced' },
]

const filterOptions = [
  { value: 'all', label: 'All', icon: Inbox },
  { value: 'unread', label: 'Unread', icon: Mail },
  { value: 'starred', label: 'Starred', icon: Star },
  { value: 'replied', label: 'Replied', icon: Reply },
  { value: 'bounced', label: 'Bounced', icon: AlertTriangle },
]

export default function MessagesPage() {
  const [threads] = useState<Thread[]>(sampleThreads)
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const filteredThreads = threads.filter((t) => {
    if (filter === 'unread' && !t.is_unread) return false
    if (filter === 'starred' && !t.is_starred) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!t.sender.toLowerCase().includes(q) && !t.company.toLowerCase().includes(q) && !t.preview.toLowerCase().includes(q)) return false
    }
    return true
  })

  const CurrentFilterIcon = filterOptions.find(f => f.value === filter)?.icon || Inbox

  return (
    <div className="flex h-full">
      <div className={cn(
        'w-full lg:w-[400px] shrink-0 border-r border-border flex flex-col bg-card/50',
        selectedThread && 'hidden lg:flex'
      )}>
        <div className="p-4 md:p-5 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-foreground/5 to-foreground/10">
              <Inbox className="h-4 w-4 text-foreground/60" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground tracking-tight">Messages</h1>
              <p className="text-xs text-muted-foreground">{threads.length} conversations</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[130px] h-9 gap-1.5">
                <CurrentFilterIcon className="h-3.5 w-3.5 text-muted-foreground/60" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map(f => (
                  <SelectItem key={f.value} value={f.value}>
                    <div className="flex items-center gap-2">
                      <f.icon className="h-3.5 w-3.5" />
                      {f.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <MessageSquare className="h-10 w-10 text-muted-foreground/20 mb-4" />
              <p className="text-sm font-medium text-foreground">No messages found</p>
              <p className="text-xs text-muted-foreground mt-1">Try a different filter or search</p>
            </div>
          ) : (
            filteredThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={cn(
                  'w-full text-left px-4 md:px-5 py-3.5 border-b border-border/50 hover:bg-accent/30 transition-colors',
                  selectedThread?.id === thread.id && 'bg-accent/50',
                  thread.is_unread && 'bg-primary/[0.02]'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {thread.is_unread && <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
                      <span className={cn(
                        'text-sm truncate',
                        thread.is_unread ? 'font-semibold text-foreground' : 'font-medium text-foreground'
                      )}>
                        {thread.sender}
                      </span>
                      <span className="text-xs text-muted-foreground/60 ml-auto shrink-0">
                        {formatRelativeTime(thread.timestamp)}
                      </span>
                    </div>
                    <p className={cn(
                      'text-xs truncate mt-0.5',
                      thread.is_unread ? 'font-medium text-foreground' : 'text-muted-foreground'
                    )}>
                      {thread.title}
                    </p>
                    <p className="text-xs text-muted-foreground/70 truncate mt-0.5 leading-relaxed">
                      {thread.preview}
                    </p>
                    <div className="flex items-center gap-2.5 mt-1.5">
                      <span className="text-[11px] font-medium text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 rounded">
                        {thread.company}
                      </span>
                      {thread.is_starred && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                      {thread.status === 'bounced' && (
                        <span className="text-[11px] font-medium text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">Bounced</span>
                      )}
                      {thread.status === 'replied' && (
                        <span className="text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Replied</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className={cn(
        'flex-1 flex flex-col',
        !selectedThread && 'hidden lg:flex lg:items-center lg:justify-center'
      )}>
        {selectedThread ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-border bg-card/30">
              <button
                onClick={() => setSelectedThread(null)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-accent -ml-1.5"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-foreground">{selectedThread.sender}</h2>
                <p className="text-xs text-muted-foreground">{selectedThread.company} · {selectedThread.title}</p>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                  <Star className={cn('h-4 w-4', selectedThread.is_starred && 'text-yellow-500 fill-yellow-500')} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="rounded-xl bg-muted/30 p-5 border border-border/40 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/10 to-blue-500/20">
                      <Mail className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{selectedThread.sender}</p>
                      <p className="text-[11px] text-muted-foreground/60">
                        {formatRelativeTime(selectedThread.timestamp)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{selectedThread.preview}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-card/50 px-4 md:px-6 py-4">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-end gap-2">
                  <textarea
                    placeholder="Type a reply..."
                    rows={2}
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30 resize-none shadow-sm transition-colors"
                  />
                  <button className="flex items-center justify-center h-10 w-10 rounded-xl bg-foreground text-background hover:opacity-90 shrink-0 shadow-sm active:scale-95 transition-all">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground/40 mt-1.5">Enter to send · Shift+Enter for newline</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center px-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-foreground/5 to-foreground/10 mb-5 shadow-sm">
              <MessageSquare className="h-6 w-6 text-muted-foreground/30" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Select a message</h3>
            <p className="text-xs text-muted-foreground/70 max-w-xs">Choose a conversation from the left to view and reply</p>
          </div>
        )}
      </div>
    </div>
  )
}
