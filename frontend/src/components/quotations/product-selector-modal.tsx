"use client"
import { useState, useEffect } from "react"
import { Search, X, ShoppingCart } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Product {
  id: number
  name: string
  description: string
  base_price: number
  image_url?: string
  category?: { name: string }
}

interface ProductSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (product: Product) => void
}

export function ProductSelectorModal({ isOpen, onClose, onSelect }: ProductSelectorModalProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchProducts()
    }
  }, [isOpen])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        // Handle both paginated and non-paginated responses
        const productsList = data.data || data
        setProducts(Array.isArray(productsList) ? productsList : [])
        setFilteredProducts(Array.isArray(productsList) ? productsList : [])
      }
    } catch (error) {
      console.error("[v0] Failed to fetch products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = products.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchQuery, products])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-red-50 to-orange-50">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
            Select Products
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition p-1 hover:bg-red-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-white sticky top-0">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-red-200 focus:border-red-600 rounded-lg outline-none transition"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border-2 border-gray-200 rounded-xl p-4 space-y-3">
                  <Skeleton className="h-40 w-full rounded-lg bg-gradient-to-br from-red-100 to-orange-100" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-10 w-10 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onSelect(product)}
                  className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-red-500 hover:shadow-lg hover:bg-red-50/30 transition-all group"
                >
                  {/* Product Image */}
                  {product.image_url ? (
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded-lg mb-3 group-hover:scale-105 transition"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/diverse-products-still-life.png"
                      }}
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg mb-3 flex items-center justify-center">
                      <ShoppingCart size={32} className="text-gray-400" />
                    </div>
                  )}

                  {/* Product Details */}
                  <p className="font-semibold text-gray-900 line-clamp-2">{product.name}</p>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{product.description}</p>
                  {product.category && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {product.category.name}
                    </span>
                  )}

                  {/* Price */}
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-lg font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                      ₱ {(product.base_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <button className="bg-gradient-to-r from-red-600 to-orange-500 text-white p-2 rounded-lg hover:scale-110 transition">
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48">
              <ShoppingCart size={48} className="text-gray-300 mb-3" />
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
