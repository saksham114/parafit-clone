'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { Recipe } from '@/lib/types'
import Card from '@/components/Card'
import CTAButton from '@/components/CTAButton'
import Toast from '@/components/Toast'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Plus, Search, Edit, Trash2, Image as ImageIcon, X } from 'lucide-react'
import { useAnalytics } from '@/hooks/useAnalytics'

interface RecipeForm {
  title: string
  description: string
  calories: number
  protein: number
  carbs: number
  fat: number
  ingredients: any[]
  steps: string[]
  image_url: string
  is_public: boolean
}

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'title' | 'created_at'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showModal, setShowModal] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [form, setForm] = useState<RecipeForm>({
    title: '',
    description: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    ingredients: [],
    steps: [''],
    image_url: '',
    is_public: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const supabase = createClient()
  const { trackInteraction } = useAnalytics()

  useEffect(() => {
    loadRecipes()
  }, [])

  useEffect(() => {
    filterAndSortRecipes()
  }, [recipes, searchTerm, sortBy, sortOrder])

  const loadRecipes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/recipes')
      if (response.ok) {
        const data = await response.json()
        if (data.ok) {
          setRecipes(data.data)
        } else {
          setToast({ type: 'error', message: data.error })
        }
      } else {
        setToast({ type: 'error', message: 'Failed to load recipes' })
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load recipes' })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortRecipes = () => {
    let filtered = recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'created_at') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredRecipes(filtered)
  }

  const openCreateModal = () => {
    setEditingRecipe(null)
    setForm({
      title: '',
      description: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      ingredients: [],
      steps: [''],
      image_url: '',
      is_public: false
    })
    setImageFile(null)
    setImagePreview('')
    setShowModal(true)
  }

  const openEditModal = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setForm({
      title: recipe.title,
      description: recipe.description || '',
      calories: recipe.calories || 0,
      protein: recipe.protein || 0,
      carbs: recipe.carbs || 0,
      fat: recipe.fat || 0,
      ingredients: recipe.ingredients || [],
      steps: recipe.steps.length > 0 ? recipe.steps : [''],
      image_url: recipe.image_url || '',
      is_public: recipe.is_public
    })
    setImagePreview(recipe.image_url || '')
    setShowModal(true)
  }

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, { upsert: false })

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      setForm(prev => ({ ...prev, image_url: publicUrl }))
      setImagePreview(publicUrl)
      setToast({ type: 'success', message: 'Image uploaded successfully!' })
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to upload image' })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
        handleImageUpload(file)
      }
    }
  }

  const addIngredient = () => {
    setForm(prev => ({ ...prev, ingredients: [...prev.ingredients, { name: '', amount: '', unit: '' }] }))
  }

  const removeIngredient = (index: number) => {
    setForm(prev => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) }))
  }

  const updateIngredient = (index: number, field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }))
  }

  const addStep = () => {
    setForm(prev => ({ ...prev, steps: [...prev.steps, ''] }))
  }

  const removeStep = (index: number) => {
    setForm(prev => ({ ...prev, steps: prev.steps.filter((_, i) => i !== index) }))
  }

  const updateStep = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? value : step)
    }))
  }

  const handleSubmit = async () => {
    if (!form.title || !form.description) {
      setToast({ type: 'error', message: 'Please fill in all required fields' })
      return
    }

    setIsSubmitting(true)
    try {
      let result
      if (editingRecipe) {
        // Update existing recipe
        result = await fetch(`/api/recipes/${editingRecipe.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
        
        // Track recipe edit
        trackInteraction('edit', 'recipe', {
          recipeId: editingRecipe.id,
          recipeTitle: form.title,
          hasImage: !!form.image_url
        })
      } else {
        // Create new recipe
        result = await fetch('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
        
        // Track recipe creation
        trackInteraction('create', 'recipe', {
          recipeTitle: form.title,
          hasImage: !!form.image_url,
          calories: form.calories.toString(),
          protein: form.protein.toString()
        })
      }

      if (result.ok) {
        const data = await result.json()
        if (data.ok) {
          setToast({ type: 'success', message: `Recipe ${editingRecipe ? 'updated' : 'created'} successfully!` })
          setShowModal(false)
          loadRecipes()
        } else {
          setToast({ type: 'error', message: data.error || 'Failed to save recipe' })
        }
      } else {
        setToast({ type: 'error', message: 'Failed to save recipe' })
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to save recipe' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteRecipe = async (recipeId: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return

    try {
      const result = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE'
      })

      if (result.ok) {
        const data = await result.json()
        if (data.ok) {
          setToast({ type: 'success', message: 'Recipe deleted successfully!' })
          loadRecipes()
          
          // Track recipe deletion
          trackInteraction('delete', 'recipe', { recipeId })
        } else {
          setToast({ type: 'error', message: data.error || 'Failed to delete recipe' })
        }
      } else {
        setToast({ type: 'error', message: 'Failed to delete recipe' })
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to delete recipe' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Manage Recipes</h1>
            <p className="text-gray-400">Create, edit, and manage recipe content</p>
          </div>
          <CTAButton onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Create Recipe
          </CTAButton>
        </div>

        {/* Search and Sort */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'title' | 'created_at')}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="created_at">Date</option>
            <option value="title">Title</option>
          </select>
          
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white hover:bg-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Recipes Table */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Recipe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Macros</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredRecipes.map((recipe) => (
                  <tr key={recipe.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {recipe.image_url && (
                          <img
                            src={recipe.image_url}
                            alt={recipe.title}
                            className="w-12 h-12 rounded-lg object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-white">{recipe.title}</div>
                          <div className="text-sm text-gray-400">{recipe.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <div className="space-y-1">
                        <div>Cal: {recipe.calories || 0}</div>
                        <div>P: {recipe.protein || 0}g</div>
                        <div>C: {recipe.carbs || 0}g</div>
                        <div>F: {recipe.fat || 0}g</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        recipe.is_public 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {recipe.is_public ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(recipe.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(recipe)}
                          className="text-teal-400 hover:text-teal-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteRecipe(recipe.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingRecipe ? 'Edit Recipe' : 'Create Recipe'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Calories</label>
                  <input
                    type="number"
                    value={form.calories}
                    onChange={(e) => setForm(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Protein (g)</label>
                  <input
                    type="number"
                    value={form.protein}
                    onChange={(e) => setForm(prev => ({ ...prev, protein: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Carbs (g)</label>
                  <input
                    type="number"
                    value={form.carbs}
                    onChange={(e) => setForm(prev => ({ ...prev, carbs: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Fat (g)</label>
                  <input
                    type="number"
                    value={form.fat}
                    onChange={(e) => setForm(prev => ({ ...prev, fat: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Recipe Image</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white cursor-pointer hover:bg-gray-700"
                  >
                    <ImageIcon className="w-4 h-4 mr-2 inline" />
                    Choose Image
                  </label>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-300">Ingredients</label>
                  <CTAButton size="sm" onClick={addIngredient}>
                    Add Ingredient
                  </CTAButton>
                </div>
                <div className="space-y-3">
                  {form.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Name"
                        value={ingredient.name || ''}
                        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Amount"
                        value={ingredient.amount || ''}
                        onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                        className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Unit"
                        value={ingredient.unit || ''}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                        className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeIngredient(index)}
                        className="px-3 py-2 text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-300">Steps</label>
                  <CTAButton size="sm" onClick={addStep}>
                    Add Step
                  </CTAButton>
                </div>
                <div className="space-y-3">
                  {form.steps.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        placeholder={`Step ${index + 1}`}
                        value={step}
                        onChange={(e) => updateStep(index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      {form.steps.length > 1 && (
                        <button
                          onClick={() => removeStep(index)}
                          className="px-3 py-2 text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Public/Private */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.is_public}
                    onChange={(e) => setForm(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-300">Make recipe public</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <CTAButton
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (editingRecipe ? 'Update Recipe' : 'Create Recipe')}
              </CTAButton>
            </div>
          </div>
        </div>
      )}

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
