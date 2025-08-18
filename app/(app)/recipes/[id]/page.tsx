'use client'

import { useState } from 'react'
import Link from 'next/link'
import Card from '@/components/Card'
import CTAButton from '@/components/CTAButton'

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('')
  
  // Get params synchronously
  useState(() => {
    params.then(({ id: recipeId }) => setId(recipeId))
  })
  
  // Mock recipe data - in a real app, this would come from an API
  const recipe = {
    id: id || '1',
    name: "Grilled Chicken Salad",
    description: "A healthy and protein-rich salad perfect for post-workout recovery. This dish combines lean protein with fresh vegetables for a nutritious and satisfying meal.",
    calories: 320,
    protein: 28,
    carbs: 12,
    fat: 18,
    prepTime: "10 min",
    cookTime: "15 min",
    servings: 2,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop",
    ingredients: [
      "2 boneless, skinless chicken breasts",
      "4 cups mixed greens",
      "1/2 cup cherry tomatoes, halved",
      "1/4 cup red onion, thinly sliced",
      "1/4 cup cucumber, diced",
      "2 tbsp olive oil",
      "1 tbsp balsamic vinegar",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Season chicken breasts with salt and pepper on both sides",
      "Heat grill to medium-high heat (400-450°F)",
      "Grill chicken for 6-8 minutes per side until cooked through (internal temperature 165°F)",
      "Let chicken rest for 5 minutes, then slice into strips",
      "In a large bowl, combine mixed greens, tomatoes, onion, and cucumber",
      "Add sliced chicken on top of the vegetables",
      "Drizzle with olive oil and balsamic vinegar",
      "Toss gently and serve immediately while still warm"
    ]
  };

  return (
    <div className="pb-24">
      {/* Sticky Image Header */}
      <div className="sticky top-0 z-40 -mx-4 mb-6">
        <div className="relative h-64 bg-gradient-to-b from-transparent to-surface">
          <img 
            src={recipe.image} 
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl font-bold text-white mb-2">{recipe.name}</h1>
            <p className="text-white/90 text-sm line-clamp-2">{recipe.description}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4">
        {/* Recipe Stats */}
        <Card variant="glass">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-text-primary">{recipe.calories}</p>
              <p className="text-sm text-text-secondary">Calories</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{recipe.protein}g</p>
              <p className="text-sm text-text-secondary">Protein</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{recipe.carbs}g</p>
              <p className="text-sm text-text-secondary">Carbs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{recipe.fat}g</p>
              <p className="text-sm text-text-secondary">Fat</p>
            </div>
          </div>
        </Card>

        {/* Recipe Info */}
        <Card variant="glass">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-text-secondary">Prep Time</p>
              <p className="text-lg font-semibold text-text-primary">{recipe.prepTime}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Cook Time</p>
              <p className="text-lg font-semibold text-text-primary">{recipe.cookTime}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Servings</p>
              <p className="text-lg font-semibold text-text-primary">{recipe.servings}</p>
            </div>
          </div>
        </Card>

        {/* Ingredients */}
        <Card>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Ingredients</h2>
          <ul className="space-y-3">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></div>
                <span className="text-text-primary leading-relaxed">{ingredient}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Instructions */}
        <Card>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Instructions</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-semibold mr-4">
                  {index + 1}
                </span>
                <span className="text-text-primary leading-relaxed">{instruction}</span>
              </li>
            ))}
          </ol>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/plan">
            <CTAButton variant="secondary" size="lg" className="w-full">
              Add to Plan
            </CTAButton>
          </Link>
          <CTAButton size="lg" className="w-full">
            Log Meal
          </CTAButton>
        </div>
      </div>
    </div>
  )
}
