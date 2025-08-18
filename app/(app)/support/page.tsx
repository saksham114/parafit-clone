'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { getMyMessages, sendMessage } from '@/lib/db-client'
import type { Message } from '@/lib/types'
import { groupMessagesByDate, formatTime } from '@/lib/utils'
import Card from '@/components/Card'
import CTAButton from '@/components/CTAButton'
import Toast from '@/components/Toast'
import LoadingSpinner from '@/components/LoadingSpinner'
import MessageBubble from '@/components/MessageBubble'
import { Send, MessageCircle } from 'lucide-react'
import { useAnalytics } from '@/hooks/useAnalytics'

interface GroupedMessages {
  [date: string]: Message[]
}

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [groupedMessages, setGroupedMessages] = useState<GroupedMessages>({})
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const { trackMessageSend } = useAnalytics()

  // Load initial messages
  useEffect(() => {
    loadMessages()
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as Message
          // Only add if it's for the current user
          if (newMessage.user_id === (supabase.auth.getUser() as any)?.data?.user?.id) {
            setMessages(prev => [...prev, newMessage])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Group messages by date whenever messages change
  useEffect(() => {
    const grouped = groupMessagesByDate(messages)
    setGroupedMessages(grouped)
  }, [messages])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async () => {
    setIsLoading(true)
    try {
      const result = await getMyMessages()
      if (result.ok) {
        setMessages(result.data)
      } else {
        setToast({ type: 'error', message: result.error })
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load messages' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const messageText = inputText.trim()
    setInputText('')

    // Optimistic UI update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      user_id: (await supabase.auth.getUser()).data.user?.id || '',
      text: messageText,
      role: 'user',
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, optimisticMessage])

    try {
      const result = await sendMessage({ text: messageText, role: 'user' })
      if (result.ok) {
        // Replace optimistic message with real one
        setMessages(prev => prev.map(msg => 
          msg.id === optimisticMessage.id ? result.data : msg
        ))
        
        // Track message sending
        trackMessageSend('support', messageText.length)
      } else {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
        setToast({ type: 'error', message: result.error })
      }
    } catch (error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
      setToast({ type: 'error', message: 'Failed to send message' })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-400">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4">
        <h1 className="text-2xl font-bold text-white mb-2">Support Chat</h1>
        <p className="text-gray-400">Get help with your fitness journey</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No messages yet</h3>
            <p className="text-gray-500">Start a conversation with our support team</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="mb-6">
              <div className="text-center mb-4">
                <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-sm">
                  {date}
                </span>
              </div>
              
              {dateMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex mb-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <MessageBubble message={message} />
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 pt-4">
        <Card className="p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
            />
            <CTAButton
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="px-4 py-2"
            >
              <Send className="w-4 h-4" />
            </CTAButton>
          </div>
        </Card>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
