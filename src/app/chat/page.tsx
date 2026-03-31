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

export default function ChatPage() {
  const [message, setMessage] = useState('')
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const conversations = api.user.getConversations.useQuery(undefined, {
    retry: 1,
    refetchOnWindowFocus: false,
  })
  const sendMessage = api.chat.sendMessage.useMutation()

  const createConversation = api.user.createConversation.useMutation({
    onSuccess: (data) => {
      setCurrentConversationId(data.id)
      setMessages([])
      void conversations.refetch()
      setIsCreatingChat(false)
    },
  })

  const conversationQuery = api.user.getConversation.useQuery(
    { id: currentConversationId! },
    {
      enabled: !!currentConversationId,
      retry: false,
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
    if (isCreatingChat) return
    setIsCreatingChat(true)
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
    if (!message.trim() || !currentConversationId) return

    const userMessageText = message
    const tempId = `temp-${Date.now()}`
    const optimisticUserMessage: Message = {
      id: tempId,
      role: 'user',
      content: userMessageText,
      createdAt: new Date(),
    }

    setMessage('')
    setIsTyping(true)
    setMessages((prev) => [...prev, optimisticUserMessage])

    try {
      const result = await sendMessage.mutateAsync({
        conversationId: currentConversationId,
        content: userMessageText,
      })

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
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId))
      console.error('Failed to send message:', error)
    } finally {
      setIsTyping(false)
      setTimeout(() => inputRef.current?.focus(), 50)
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
    <div className="flex h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-40
        w-80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-r border-slate-200/50 dark:border-slate-700/50
        transform transition-all duration-300 ease-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col shadow-2xl lg:shadow-none
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 blur-lg opacity-50 rounded-xl"></div>
              <div className="relative w-11 h-11 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="font-bold text-lg bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">Jarvis AI</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Groq</p>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={handleNewChat}
            disabled={isCreatingChat}
            className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3.5 px-4 rounded-2xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-70 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="relative z-10">{isCreatingChat ? 'Creating...' : 'New Chat'}</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5 scrollbar-thin">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-3">
            Recent Conversations
          </p>
          {conversations.data?.map((conv, idx) => (
            <div
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
              className={`
                group relative p-3.5 rounded-2xl cursor-pointer transition-all duration-200
                ${currentConversationId === conv.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 active:scale-[0.98]'
                }
              `}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${currentConversationId === conv.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {conv.title}
                  </p>
                  <p className={`text-xs truncate mt-0.5 ${currentConversationId === conv.id ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
                    {conv.messages[0]?.content.slice(0, 50) || 'Empty conversation'}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(e, conv.id)}
                  className={`
                    p-1.5 rounded-lg transition-all duration-200
                    ${currentConversationId === conv.id 
                      ? 'text-white/60 hover:text-white hover:bg-white/20' 
                      : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }
                  `}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {conversations.data?.length === 0 && (
            <div className="text-center py-8 px-4">
              <div className="w-12 h-12 mx-auto bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">No conversations yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Start a new chat to begin</p>
            </div>
          )}
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={() => void signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500/70 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 font-medium"
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
        <header className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 blur-lg opacity-30 rounded-full"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="font-semibold text-slate-900 dark:text-white">Jarvis AI</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Online • Ready to help</p>
              </div>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.length === 0 && !currentConversationId && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-lg mx-auto px-4">
                <div className="relative inline-block mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 blur-3xl opacity-30 rounded-3xl"></div>
                  <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-float">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                  Hello, I&apos;m <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Jarvis</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-base mb-10">
                  Your AI assistant powered by Groq. Ask me anything - I&apos;m here to help!
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '✍️', text: 'Write a poem', color: 'from-blue-500 to-cyan-500' },
                    { icon: '🔬', text: 'Explain science', color: 'from-purple-500 to-pink-500' },
                    { icon: '💻', text: 'Help with code', color: 'from-green-500 to-emerald-500' },
                    { icon: '🍳', text: 'Recipe ideas', color: 'from-orange-500 to-red-500' },
                  ].map((suggestion) => (
                    <button
                      key={suggestion.text}
                      onClick={() => {
                        if (!currentConversationId) {
                          handleNewChat()
                        }
                        setTimeout(() => {
                          setMessage(suggestion.text)
                          inputRef.current?.focus()
                        }, 300)
                      }}
                      className={`
                        p-4 text-left rounded-2xl bg-white dark:bg-slate-800/60 backdrop-blur-sm
                        border border-slate-200/50 dark:border-slate-700/50
                        hover:border-transparent hover:shadow-lg hover:shadow-purple-500/10
                        transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                        group
                      `}
                    >
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${suggestion.color} flex items-center justify-center text-sm mb-2 shadow-md`}>
                        {suggestion.icon}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        {suggestion.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.length === 0 && currentConversationId && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                  <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-slate-500 dark:text-slate-400">Send a message to start the conversation</p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 animate-messageIn ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                  : 'bg-gradient-to-br from-purple-500 to-pink-500'
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

              <div className={`flex-1 max-w-2xl ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`inline-block p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tr-sm shadow-lg shadow-blue-500/20'
                      : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-800 dark:text-slate-100 rounded-tl-sm shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-700/50'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                </div>
                <p className={`text-[11px] text-slate-400 mt-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4 animate-messageIn">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-4 rounded-2xl rounded-tl-sm shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="relative group">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={currentConversationId ? 'Type your message... I\'m listening...' : 'Start a new chat first'}
                disabled={!currentConversationId || isTyping}
                className="w-full px-6 py-4 pr-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all duration-300 disabled:opacity-50 text-slate-900 dark:text-white placeholder-slate-400 shadow-lg group-hover:shadow-xl"
              />
              <button
                type="submit"
                disabled={!currentConversationId || !message.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all duration-200 shadow-lg shadow-purple-500/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-center text-[11px] text-slate-400 mt-3">
              Press Enter to send • Shift+Enter for new line
            </p>
          </form>
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes messageIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-messageIn {
          animation: messageIn 0.4s ease-out forwards;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>
    </div>
  )
}
