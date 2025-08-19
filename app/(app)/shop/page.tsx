'use client'

import { Search } from 'lucide-react'

// Mock product data
const products = [
  {
    id: 1,
    name: 'Peri Peri Yogurt Dip',
    price: '158 INR',
    image: '/banners/1.jpg',
    inStock: true
  },
  {
    id: 2,
    name: 'Quinoa Salad Bowl',
    price: '245 INR',
    image: '/banners/2.jpg',
    inStock: true
  },
  {
    id: 3,
    name: 'Green Smoothie Mix',
    price: '189 INR',
    image: '/banners/3.jpg',
    inStock: false
  },
  {
    id: 4,
    name: 'Protein Energy Bars',
    price: '320 INR',
    image: '/banners/1.jpg',
    inStock: true
  },
  {
    id: 5,
    name: 'Organic Tea Blend',
    price: '125 INR',
    image: '/banners/2.jpg',
    inStock: true
  },
  {
    id: 6,
    name: 'Superfood Powder',
    price: '450 INR',
    image: '/banners/3.jpg',
    inStock: true
  }
]

export default function ShopPage() {
  const handleSearch = (query: string) => {
    console.log('Searching for:', query)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search Products here..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        {/* Category Chips */}
        <div className="flex overflow-x-auto pb-2">
          <button className="chip chip-soft mr-2 whitespace-nowrap">Healthy Desserts</button>
          <button className="chip chip-brand mr-2 whitespace-nowrap">Appetizers</button>
          <button className="chip chip-brand/50 mr-2 whitespace-nowrap">Detox Waters</button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4 p-4 max-w-screen-sm mx-auto">
          {products.map((product) => (
            <div key={product.id} className="card overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-32 object-cover" 
              />
              <div className="p-3">
                <span className={`chip ${product.inStock ? 'chip-success' : 'chip-warn'} mb-2`}>
                  {product.inStock ? 'In Stock' : 'Low Stock'}
                </span>
                <h3 className="font-medium leading-snug text-gray-900">{product.name}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{product.price}</span>
                  <button className="px-3 py-1 rounded-full bg-white border border-brand-200 text-brand-700 hover:bg-brand-50 transition-colors">
                    ADD
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
