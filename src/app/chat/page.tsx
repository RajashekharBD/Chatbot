'use client'

import { useState, useRef, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { api } from '@/lib/trpc'

interface Message {
  id: string
  role: string
  content: string
  createdAt: string | Date
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
}

export default function ChatPage() {
  const [message, setMessage] = useState('')
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const conversations = api.user.getConversations.useQuery(undefined, {
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  })
  const sendMessage = api.chat.sendMessage.useMutation()

  const createConversation = api.user.createConversation.useMutation({
    onSuccess: (data) => {
      setCurrentConversationId(data.id)
      setMessages([])
      void conversations.refetch()
    },
  })

  const conversationQuery = api.user.getConversation.useQuery(
    { id: currentConversationId! },
    {
      enabled: !!currentConversationId,
      retry: false,
      staleTime: 60000,
    }
  )

  useEffect(() => {
    if (conversationQuery.data?.messages) {
      setMessages(conversationQuery.data.messages as Message[])
    }
  }, [conversationQuery.data])

  const deleteConversation = api.user.deleteConversation.useMutation({
    onSuccess: () => {
      if (currentConversationId) {
        setCurrentConversationId(null)
        setMessages([])
      }
      void conversations.refetch()
    },
  })

  const handleNewChat = () => {
    createConversation.mutate({})
  }

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id)
  }

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('Delete this chat?')) {
      deleteConversation.mutate({ id })
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const cleanedMessage = message.replace(/!\[.*?\]\(.*?\)/g, '').trim()
    
    if (!cleanedMessage || !currentConversationId) {
      setError('Please enter a text message only. Images are not supported.')
      setTimeout(() => setError(null), 3000)
      return
    }

    const tempId = `temp-${Date.now()}`
    const optimisticUserMessage: Message = {
      id: tempId,
      role: 'user',
      content: cleanedMessage,
      createdAt: new Date(),
    }

    setMessage('')
    setIsTyping(true)
    setError(null)
    
    // Show user message immediately (optimistic update)
    setMessages((prev) => [...prev, optimisticUserMessage])

    try {
      const result = await sendMessage.mutateAsync({
        conversationId: currentConversationId,
        content: cleanedMessage,
      })

      // Replace optimistic message with real one
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== tempId)
        return [
          ...filtered,
          result.userMessage as Message,
          result.aiMessage as Message,
        ]
      })
      void conversations.refetch()
    } catch (error) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId))
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
      console.error('Failed to send message:', error)
    } finally {
      setIsTyping(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-40
        w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">Jarvis AI</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Your AI Assistant</p>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2">
            Recent Chats
          </p>
          {conversations.data?.map((conv: Conversation) => (
            <div
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
              className={`
                group relative p-3 rounded-xl cursor-pointer transition-all duration-200
                ${currentConversationId === conv.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${currentConversationId === conv.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {conv.title}
                  </p>
                  <p className={`text-sm truncate mt-1 ${currentConversationId === conv.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    {conv.messages[0]?.content.slice(0, 40) || 'No messages'}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(e, conv.id)}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/20 transition-all ${currentConversationId === conv.id ? 'text-white/80' : 'text-gray-400'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => void signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">Jarvis AI</h1>
              <p className="text-sm text-green-500">Online</p>
            </div>
          </div>
        </header>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs text-red-500 hover:text-red-600 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && !currentConversationId && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome to Jarvis AI
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Your personal AI assistant powered by Groq. Ask me anything!
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  {['Write a poem', 'Explain quantum physics', 'Help with code', 'Recipe ideas'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        if (!currentConversationId) {
                          handleNewChat()
                        }
                        setTimeout(() => setMessage(suggestion), 100)
                      }}
                      className="p-3 text-left text-sm bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              style={{ animation: 'fadeIn 0.3s ease-out' }}
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                  : 'bg-gradient-to-br from-purple-500 to-purple-600'
              }`}>
                {msg.role === 'user' ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
              </div>

              {/* Message Bubble */}
              <div className={`flex-1 max-w-2xl ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`inline-block p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-md'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-md shadow-lg'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
                <p className={`text-xs text-gray-400 mt-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-md shadow-lg">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isTyping ? 'Waiting for response...' : (currentConversationId ? 'Type your message...' : 'Start a new chat first')}
                disabled={!currentConversationId}
                className="w-full px-6 py-4 pr-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={!currentConversationId || !message.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
