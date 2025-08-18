'use client'

import { useState, useEffect, useCallback } from 'react'

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
  className?: string
}

export default function SearchBar({ 
  placeholder = "Search...", 
  onSearch, 
  className = '' 
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Trigger search when debounced query changes
  useEffect(() => {
    onSearch(debouncedQuery)
  }, [debouncedQuery, onSearch])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }, [])

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 bg-card/60 border border-card/40 rounded-2xl text-text-primary placeholder-text-secondary/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
      />
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl text-text-secondary">
        🔍
      </span>
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  )
}

