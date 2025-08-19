'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { useAnalytics } from '@/hooks/useAnalytics'

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { trackRecipeOpen, trackInteraction } = useAnalytics()
  
  const recipes = [
    {
      id: 1,
      name: "Grilled Chicken Salad",
      description: "A healthy and protein-rich salad perfect for post-workout recovery",
      calories: 320,
      protein: 28,
      carbs: 12,
      fat: 18,
      image: "🍗",
      time: "15 min",
      thumbnail: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      name: "Quinoa Bowl",
      description: "Nutritious quinoa bowl with fresh vegetables and lean protein",
      calories: 450,
      protein: 16,
      carbs: 65,
      fat: 12,
      image: "🥗",
      time: "25 min",
      thumbnail: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      name: "Salmon with Vegetables",
      description: "Omega-3 rich salmon with roasted seasonal vegetables",
      calories: 380,
      protein: 32,
      carbs: 18,
      fat: 22,
      image: "🐟",
      time: "20 min",
      thumbnail: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop"
    },
    {
      id: 4,
      name: "Protein Smoothie",
      description: "High-protein smoothie with berries and banana",
      calories: 280,
      protein: 24,
      carbs: 32,
      fat: 8,
      image: "🥤",
      time: "5 min",
      thumbnail: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop"
    },
    {
      id: 5,
      name: "Turkey Wrap",
      description: "Lean turkey wrap with fresh vegetables and whole grain tortilla",
      calories: 340,
      protein: 26,
      carbs: 28,
      fat: 14,
      image: "🌯",
      time: "10 min",
      thumbnail: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop"
    },
    {
      id: 6,
      name: "Greek Yogurt Parfait",
      description: "Creamy Greek yogurt with granola and fresh berries",
      calories: 220,
      protein: 18,
      carbs: 24,
      fat: 6,
      image: "🍯",
      time: "5 min",
      thumbnail: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop"
    }
  ];

  const filteredRecipes = useMemo(() => {
    if (!searchQuery) return recipes
    return recipes.filter(recipe => 
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [recipes, searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      trackInteraction('search', 'recipe_search', { query, results: filteredRecipes.length })
    }
  }

  const handleRecipeClick = (recipe: any) => {
    trackRecipeOpen(recipe.id.toString(), recipe.name)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-sm mx-auto p-4 space-y-4">
        {/* Search Bar */}
        <div>
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-full shadow-card border border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Recipes Grid */}
        <div className="space-y-4">
          {filteredRecipes.map((recipe) => (
            <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
                <CardContent className="p-0">
                  <div className="flex gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img 
                        src={recipe.thumbnail} 
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Recipe Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{recipe.name}</h3>
                        <span className="inline-block bg-brand-100 text-brand-700 text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2">
                          {recipe.time}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                      
                      {/* Macro Chips */}
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-block bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                          {recipe.calories} kcal
                        </span>
                        <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                          P: {recipe.protein}g
                        </span>
                        <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          C: {recipe.carbs}g
                        </span>
                        <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                          F: {recipe.fat}g
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          
          {filteredRecipes.length === 0 && (
            <Card className="text-center py-8">
              <p className="text-gray-600">No recipes found matching "{searchQuery}"</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search terms</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
