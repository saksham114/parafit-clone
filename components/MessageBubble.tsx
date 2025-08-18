import { formatTime } from '@/lib/utils'

interface MessageBubbleProps {
  message: {
    text: string
    role: 'user' | 'assistant'
    created_at: string
  }
  className?: string
}

export default function MessageBubble({ message, className = '' }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  
  return (
    <div
      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
        isUser
          ? 'bg-teal-500 text-white'
          : 'bg-gray-700 text-gray-100'
      } ${className}`}
    >
      <p className="text-sm">{message.text}</p>
      <p className={`text-xs mt-2 ${
        isUser ? 'text-teal-100' : 'text-gray-400'
      }`}>
        {formatTime(message.created_at)}
      </p>
    </div>
  )
}
