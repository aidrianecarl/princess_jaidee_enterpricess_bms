"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Download, Trash2, Edit, Eye } from "lucide-react"

export function ProductsModule() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Products</h1>
          <p className="text-neutral-600">Manage all products and inventory</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="discontinued">Discontinued</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition">
          <Download size={20} />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin inline-block">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-neutral-900">Product Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-neutral-900">SKU</th>
                  <th className="px-6 py-4 text-left font-semibold text-neutral-900">Price</th>
                  <th className="px-6 py-4 text-left font-semibold text-neutral-900">Stock</th>
                  <th className="px-6 py-4 text-left font-semibold text-neutral-900">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-neutral-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-neutral-200 hover:bg-neutral-50">
                    <td className="px-6 py-4 font-medium text-neutral-900">Sample Product {i + 1}</td>
                    <td className="px-6 py-4 text-neutral-600">SKU-{1000 + i}</td>
                    <td className="px-6 py-4 font-semibold">₱500</td>
                    <td className="px-6 py-4">25 units</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-neutral-200 rounded transition">
                          <Eye size={18} className="text-neutral-600" />
                        </button>
                        <button className="p-2 hover:bg-neutral-200 rounded transition">
                          <Edit size={18} className="text-neutral-600" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded transition">
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
