import { ChatProvider, useChat } from '@/contexts/ChatContext'
import ChatSidebar from '@/components/chat/ChatSidebar'
import { MessageList } from '@/components/chat/MessageList'
import ChatInput from '@/components/chat/ChatInput'
import SuggestionChips from '@/components/chat/SuggestionChips'
import { ProcessingIndicator } from '@/components/chat/ProcessingIndicator'
import { ErrorMessage } from '@/components/chat/ErrorMessage'

function ChatContent() {
  const { messages, isStreaming, processing, error, sendMessage, clearChat } = useChat()

  return (
    <div className="flex h-full">
      <ChatSidebar />
      <div className="flex-1 flex flex-col h-full">
        <MessageList messages={messages} processing={processing ? <ProcessingIndicator processing={processing} /> : null}>
          {error && (
            <ErrorMessage
              message={error}
              onRetry={() => {}}
              onContinue={() => {}}
            />
          )}
        </MessageList>

        {messages.length === 0 && !isStreaming && (
          <SuggestionChips onSelect={(text) => sendMessage(text)} />
        )}

        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatContent />
    </ChatProvider>
  )
}
