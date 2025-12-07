import { useEffect, useMemo, useState } from 'react'
import { LuFilter, LuSearch, LuSlidersHorizontal } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../../components/products/ProductCard'
import PrimaryButton from '../../components/common/PrimaryButton'
import { logEvent, logError } from '../../services/logger'
import { listProducts, addToCart } from '../../services/firebase/firestore'
import { addGuestItem } from '../../services/localCart'
import { useAuth } from '../../context/AuthContext'

const Filters = ({ categories, selectedCategory, onCategoryChange, locations, selectedLocation, onLocationChange, ratingFilter, onRatingChange }) => (
  <aside className="space-y-4 rounded-2xl border border-border bg-bg-elevated/80 p-4 shadow-subtle">
    <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
      <LuFilter /> Filters
    </div>
    <div className="space-y-2 rounded-xl border border-border px-3 py-2">
      <p className="text-xs uppercase tracking-[0.12em] text-text-secondary">Category</p>
      <div className="flex flex-wrap gap-2">
        <button
          className={`rounded-full border px-3 py-1 text-xs transition ${selectedCategory === 'All' ? 'border-accent text-accent' : 'border-border text-text-secondary hover:border-accent hover:text-accent'}`}
          onClick={() => onCategoryChange('All')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`rounded-full border px-3 py-1 text-xs transition ${selectedCategory === cat ? 'border-accent text-accent' : 'border-border text-text-secondary hover:border-accent hover:text-accent'}`}
            onClick={() => onCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>

    <div className="space-y-2 rounded-xl border border-border px-3 py-2">
      <p className="text-xs uppercase tracking-[0.12em] text-text-secondary">Location</p>
      <div className="flex flex-wrap gap-2">
        <button
          className={`rounded-full border px-3 py-1 text-xs transition ${selectedLocation === 'All' ? 'border-accent text-accent' : 'border-border text-text-secondary hover:border-accent hover:text-accent'}`}
          onClick={() => onLocationChange('All')}
        >
          All
        </button>
        {locations.map((loc) => (
          <button
            key={loc}
            className={`rounded-full border px-3 py-1 text-xs transition ${selectedLocation === loc ? 'border-accent text-accent' : 'border-border text-text-secondary hover:border-accent hover:text-accent'}`}
            onClick={() => onLocationChange(loc)}
          >
            {loc}
          </button>
        ))}
      </div>
    </div>

    <div className="space-y-2 rounded-xl border border-border px-3 py-2">
      <p className="text-xs uppercase tracking-[0.12em] text-text-secondary">Rating</p>
      <div className="flex flex-wrap gap-2">
        {[0, 3, 4].map((r) => (
          <button
            key={r}
            className={`rounded-full border px-3 py-1 text-xs transition ${ratingFilter === r ? 'border-accent text-accent' : 'border-border text-text-secondary hover:border-accent hover:text-accent'}`}
            onClick={() => onRatingChange(r)}
          >
            {r === 0 ? 'Any' : `${r}★ & up`}
          </button>
        ))}
      </div>
    </div>
  </aside>
)

const ProductsPage = () => {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLocation, setSelectedLocation] = useState('All')
  const [ratingFilter, setRatingFilter] = useState(0)
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    logEvent('info', 'products', 'viewed')
    const load = async () => {
      setLoading(true)
      try {
        const remote = await listProducts()
        if (remote.length) setProducts(remote)
      } catch (error) {
        logError('products', 'list-ui-failed', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleQuickAdd = async (product) => {
    const payload = {
      productId: product.id || product.name,
      name: product.name,
      price: Number(product.price) || 0,
      qty: 1,
      image: product.image || product.images?.[0],
      sellerId: product.sellerId || product.seller || product.sellerName,
      sellerName: product.sellerName || product.seller,
    }
    if (!user?.uid) {
      const items = addGuestItem(payload)
      window.dispatchEvent(
        new CustomEvent('cart-count-changed', {
          detail: { absolute: items.reduce((sum, i) => sum + (i.qty || 1), 0) },
        }),
      )
      logEvent('info', 'cart', 'add-guest', { productId: payload.productId })
      return
    }
    try {
      await addToCart(user.uid, payload)
      logEvent('info', 'cart', 'add-quick', { productId: payload.productId })
      window.dispatchEvent(new CustomEvent('cart-count-changed', { detail: { delta: 1 } }))
    } catch (error) {
      logError('cart', 'add-quick-failed', error)
    }
  }

  const filtered = useMemo(() => {
    const term = query.toLowerCase()
    const filteredList = products.filter((p) => {
      const name = (p.name || '').toLowerCase()
      const seller = (p.seller || p.sellerName || '').toLowerCase()
      const category = (p.category || '').toLowerCase()
      const matchesSearch = name.includes(term) || seller.includes(term) || category.includes(term)
      const matchesCategory =
        selectedCategory === 'All' ||
        (p.category || '').toLowerCase() === selectedCategory.toLowerCase()
      const matchesLocation =
        selectedLocation === 'All' ||
        (p.location || '').toLowerCase() === selectedLocation.toLowerCase()
      const matchesRating = !ratingFilter || (Number(p.rating) || 0) >= ratingFilter
      return matchesSearch && matchesCategory && matchesLocation && matchesRating
    })
    const sorted = [...filteredList].sort((a, b) => {
      const ratingA = Number(a.rating) || 0
      const ratingB = Number(b.rating) || 0
      const priceA = Number(String(a.price).replace(/\D/g, '')) || 0
      const priceB = Number(String(b.price).replace(/\D/g, '')) || 0
      const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
      const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
      if (sortBy === 'rating') return ratingB - ratingA
      if (sortBy === 'priceLow') return priceA - priceB
      if (sortBy === 'priceHigh') return priceB - priceA
      return dateB - dateA
    })
    return sorted
  }, [query, products, selectedCategory, selectedLocation, ratingFilter, sortBy])

  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <Filters
        categories={[...new Set(products.map((p) => p.category).filter(Boolean))]}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        locations={[...new Set(products.map((p) => p.location).filter(Boolean))]}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        ratingFilter={ratingFilter}
        onRatingChange={setRatingFilter}
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
              Explore
            </p>
            <h1 className="font-display text-3xl text-text-primary">
              Catering collections
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <LuSearch className="absolute left-3 top-3 text-text-secondary" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chefs or cuisines"
                className="h-11 rounded-xl border border-border bg-bg-base pl-9 pr-3 text-sm text-text-primary shadow-inner outline-none transition focus:border-accent focus:shadow-glow"
              />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-bg-base px-2">
              <LuSlidersHorizontal className="text-text-secondary" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 bg-transparent text-sm text-text-primary outline-none"
              >
                <option value="recent">Newest</option>
                <option value="rating">Top rated</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-text-secondary">Loading menus...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard
                key={product.id || product.name}
                product={product}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductsPage