import { useState } from 'react'
import { Search, Mail, Star, MessageSquare, Filter, ChevronLeft } from 'lucide-react'
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

  return (
    <div className="flex h-full">
      {/* Thread list */}
      <div className={cn(
        'w-full lg:w-[380px] shrink-0 border-r border-border flex flex-col',
        selectedThread && 'hidden lg:flex'
      )}>
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-bold text-foreground mb-3">Messages</h1>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="starred">Starred</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No messages found</p>
            </div>
          ) : (
            filteredThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={cn(
                  'w-full text-left px-4 py-3 border-b border-border hover:bg-accent/30 transition-colors',
                  selectedThread?.id === thread.id && 'bg-accent/50'
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {thread.is_unread && <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
                      <span className={cn('text-sm truncate', thread.is_unread ? 'font-semibold text-foreground' : 'text-foreground')}>
                        {thread.sender}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto shrink-0">
                        {formatRelativeTime(thread.timestamp)}
                      </span>
                    </div>
                    <p className={cn('text-xs truncate mt-0.5', thread.is_unread ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                      {thread.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{thread.preview}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-muted-foreground">{thread.company}</span>
                      {thread.is_starred && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                      {thread.status === 'bounced' && <span className="text-[11px] text-red-500">Bounced</span>}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Thread detail */}
      <div className={cn(
        'flex-1 flex flex-col',
        !selectedThread && 'hidden lg:flex lg:items-center lg:justify-center'
      )}>
        {selectedThread ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <button
                onClick={() => setSelectedThread(null)}
                className="lg:hidden p-1 rounded-lg hover:bg-accent"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-foreground">{selectedThread.sender}</h2>
                <p className="text-xs text-muted-foreground">{selectedThread.company}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="rounded-xl bg-muted/30 p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(selectedThread.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{selectedThread.preview}</p>
              </div>
            </div>

            <div className="border-t border-border p-4">
              <div className="flex items-center gap-2">
                <textarea
                  placeholder="Type a reply..."
                  rows={2}
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/20 resize-none"
                />
                <button className="flex items-center justify-center h-10 w-10 rounded-xl bg-foreground text-background hover:opacity-90 shrink-0">
                  <Mail className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground/50 mt-1">Enter to send · Shift+Enter for newline</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center px-4">
            <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">Select a message</h3>
            <p className="text-xs text-muted-foreground">Choose a conversation from the left to view</p>
          </div>
        )}
      </div>
    </div>
  )
}
