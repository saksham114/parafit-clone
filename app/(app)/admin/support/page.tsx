'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { getUsersWithLatestMessages, getChatThread, sendAdminMessage } from '@/lib/db-client'
import type { UserWithLatestMessage, ChatThread, Message } from '@/lib/types'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { formatTime, truncateText } from '@/lib/utils'
import Card from '@/components/Card'
import CTAButton from '@/components/CTAButton'
import Toast from '@/components/Toast'
import OnlineIndicator from '@/components/OnlineIndicator'
import LoadingSpinner from '@/components/LoadingSpinner'
import MessageBubble from '@/components/MessageBubble'
import { MessageCircle, Send, Circle, Users, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAnalytics } from '@/hooks/useAnalytics'

export default function AdminSupportPage() {
  const [users, setUsers] = useState<UserWithLatestMessage[]>([])
  const [selectedUser, setSelectedUser] = useState<UserWithLatestMessage | null>(null)
  const [chatThread, setChatThread] = useState<ChatThread | null>(null)
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { trackMessageSend, trackInteraction } = useAnalytics()

  // Track online status for selected user
  const isSelectedUserOnline = useOnlineStatus(selectedUser?.user_id || '')

  // Update selected user's online status
  useEffect(() => {
    if (selectedUser && isSelectedUserOnline !== undefined) {
      setUsers(prev => prev.map(user => 
        user.user_id === selectedUser.user_id 
          ? { ...user, is_online: isSelectedUserOnline }
          : user
      ))
      setSelectedUser(prev => prev ? { ...prev, is_online: isSelectedUserOnline } : null)
    }
  }, [isSelectedUserOnline, selectedUser])

  // Check admin access on mount
  useEffect(() => {
    checkAdminAccess()
  }, [])

  // Load users list
  useEffect(() => {
    if (isAdmin) {
      loadUsers()
    }
  }, [isAdmin])

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!isAdmin) return

    const channel = supabase
      .channel('admin-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          // Refresh users list and current chat thread
          if (isAdmin) {
            loadUsers()
            if (selectedUser) {
              loadChatThread(selectedUser.user_id)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, isAdmin, selectedUser])

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/sign-in')
        return
      }

      // Check if user has admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)
    } catch (error) {
      router.push('/dashboard')
    }
  }

  const loadUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const result = await getUsersWithLatestMessages()
      if (result.ok) {
        setUsers(result.data)
        // Auto-select first user if none selected
        if (!selectedUser && result.data.length > 0) {
          setSelectedUser(result.data[0])
          loadChatThread(result.data[0].user_id)
        }
      } else {
        setToast({ type: 'error', message: result.error })
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load users' })
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const loadChatThread = async (userId: string) => {
    setIsLoading(true)
    try {
      const result = await getChatThread(userId)
      if (result.ok) {
        setChatThread(result.data)
      } else {
        setToast({ type: 'error', message: result.error })
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load chat thread' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserSelect = (user: UserWithLatestMessage) => {
    setSelectedUser(user)
    loadChatThread(user.user_id)
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedUser) return

    const messageText = inputText.trim()
    setInputText('')

    // Optimistic UI update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      user_id: selectedUser.user_id,
      text: messageText,
      role: 'assistant',
      created_at: new Date().toISOString()
    }

    setChatThread(prev => prev ? {
      ...prev,
      messages: [...prev.messages, optimisticMessage]
    } : null)

    try {
      const result = await sendAdminMessage(selectedUser.user_id, messageText)
      if (result.ok) {
        // Replace optimistic message with real one
        setChatThread(prev => prev ? {
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === optimisticMessage.id ? result.data : msg
          )
        } : null)
        
        // Track admin message sending
        trackMessageSend('admin', messageText.length)
        
        // Track support interaction
        trackInteraction('reply', 'admin_support', {
          userId: selectedUser.user_id,
          messageLength: messageText.length
        })
        
        // Refresh users list to update latest message
        loadUsers()
      } else {
        // Remove optimistic message on error
        setChatThread(prev => prev ? {
          ...prev,
          messages: prev.messages.filter(msg => msg.id !== optimisticMessage.id)
        } : null)
        setToast({ type: 'error', message: result.error })
      }
    } catch (error) {
      // Remove optimistic message on error
      setChatThread(prev => prev ? {
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== optimisticMessage.id)
      } : null)
      setToast({ type: 'error', message: 'Failed to send message' })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatLatestMessage = (text: string) => {
    return truncateText(text, 50)
  }

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-400">Checking permissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex">
      {/* Left Pane - Users List */}
      <div className="w-80 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-teal-400" />
            <h1 className="text-xl font-bold text-white">Support Users</h1>
          </div>
          <p className="text-gray-400 text-sm">Manage user conversations</p>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingUsers ? (
            <div className="p-6 text-center">
              <LoadingSpinner size="md" className="mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center">
              <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No users with messages</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.user_id}
                onClick={() => handleUserSelect(user)}
                className={`p-4 cursor-pointer border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                  selectedUser?.user_id === user.user_id ? 'bg-gray-800' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name || 'User'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 font-semibold">
                          {user.full_name?.[0] || 'U'}
                        </span>
                      )}
                    </div>
                    {/* Online indicator */}
                    <OnlineIndicator 
                      isOnline={user.is_online} 
                      size="sm" 
                      className="absolute -bottom-1 -right-1" 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">
                        {user.full_name || 'Anonymous User'}
                      </h3>
                      {user.unread_count > 0 && (
                        <div className="w-2 h-2 bg-red-400 rounded-full" />
                      )}
                    </div>
                    
                    {user.latest_message ? (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">
                          {user.latest_message.role === 'user' ? 'User' : 'Admin'}
                        </p>
                        <p className="text-sm text-gray-300 truncate">
                          {formatLatestMessage(user.latest_message.text)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(user.latest_message.created_at)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No messages yet</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane - Chat Thread */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-6 pb-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  {selectedUser.avatar_url ? (
                    <img
                      src={selectedUser.avatar_url}
                      alt={selectedUser.full_name || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 font-semibold">
                      {selectedUser.full_name?.[0] || 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {selectedUser.full_name || 'Anonymous User'}
                  </h2>
                  <div className="flex items-center gap-2">
                    <OnlineIndicator isOnline={selectedUser.is_online} size="sm" />
                    <span className="text-sm text-gray-400">
                      {selectedUser.is_online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <LoadingSpinner size="md" className="mx-auto mb-4" />
                  <p className="text-gray-400">Loading messages...</p>
                </div>
              ) : chatThread && chatThread.messages.length > 0 ? (
                <div className="space-y-4">
                  {chatThread.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === 'assistant' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <MessageBubble message={message} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No messages yet</h3>
                  <p className="text-gray-500">Start the conversation</p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 pt-4 border-t border-gray-800">
              <Card className="p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your reply..."
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Select a user</h3>
              <p className="text-gray-500">Choose a user from the list to start chatting</p>
            </div>
          </div>
        )}
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
