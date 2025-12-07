import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { LuStar, LuMapPin, LuClock3, LuUsers } from 'react-icons/lu'
import PrimaryButton from '../../components/common/PrimaryButton'
import LazyImage from '../../components/common/LazyImage'
import { logEvent, logError } from '../../services/logger'
import { addToCart } from '../../services/firebase/firestore'
import { getProduct } from '../../services/firebase/firestore'
import { addGuestItem } from '../../services/localCart'
import { useAuth } from '../../context/AuthContext'

const fallback = {
  name: 'Royal Nawabi Spread',
  description:
    'An immersive multi-course Nawabi experience with kebabs, aromatic biryanis, and slow-cooked gravies.',
  price: '2,499',
  seller: 'Chef Aarav',
  location: 'Lucknow, India',
  serves: 20,
  preparationTime: '6-8 hours',
  images: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1600&q=80',
  ],
}

const ProductDetailPage = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [product, setProduct] = useState(fallback)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    logEvent('info', 'product-detail', 'viewed', { id })
    const load = async () => {
      try {
        if (!id) return
        const data = await getProduct(id)
        if (data) setProduct({ ...fallback, ...data })
      } catch (error) {
        logError('product-detail', 'load-failed', error, { id })
      }
    }
    load()
  }, [id])

  const handleAdd = async () => {
    const payload = {
      productId: id || product.id || product.name,
      name: product.name,
      price: Number(product.price) || 0,
      qty: 1,
      image: product.images?.[0],
      sellerId: product.sellerId || product.seller,
      sellerName: product.sellerName || product.seller,
    }
    if (!user?.uid) {
      const items = addGuestItem(payload)
      window.dispatchEvent(
        new CustomEvent('cart-count-changed', {
          detail: { absolute: items.reduce((sum, i) => sum + (i.qty || 1), 0) },
        }),
      )
      return
    }
    setAdding(true)
    try {
      await addToCart(user.uid, payload)
      logEvent('info', 'cart', 'add-from-detail', { id })
      window.dispatchEvent(new CustomEvent('cart-count-changed', { detail: { delta: 1 } }))
    } catch (error) {
      logError('cart', 'add-from-detail-failed', error, { id })
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <LazyImage
            src={product.images?.[0]}
            alt={product.name}
            className="h-[380px] w-full rounded-3xl object-cover shadow-card"
            placeholderClassName="h-[380px] w-full rounded-3xl"
          />
          <div className="grid grid-cols-3 gap-3">
            {(product.images || []).slice(1).map((img) => (
              <LazyImage
                key={img}
                src={img}
                alt={product.name}
                className="h-24 w-full rounded-xl object-cover"
                placeholderClassName="h-24 w-full rounded-xl"
              />
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-border bg-bg-elevated/80 p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
                Premium experience
              </p>
              <h1 className="font-display text-3xl text-text-primary">
                {product.name}
              </h1>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1 text-sm text-accent">
              <LuStar /> {product.rating || 4.8}
            </div>
          </div>
          <p className="text-text-secondary">{product.description}</p>
          <div className="grid grid-cols-2 gap-3 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <LuMapPin className="text-accent" /> {product.location || 'Pan-India'}
            </div>
            <div className="flex items-center gap-2">
              <LuClock3 className="text-accent" /> Prep:{' '}
              {product.preparationTime || '6 hours'}
            </div>
            <div className="flex items-center gap-2">
              <LuUsers className="text-accent" /> Serves: {product.serves || 10} guests
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border bg-bg-base/80 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
                Price per guest
              </p>
              <p className="text-3xl font-semibold text-text-primary">
                ₹{product.price}
              </p>
            </div>
            <div className="flex gap-2">
              <PrimaryButton variant="outline">Save as Draft</PrimaryButton>
              <PrimaryButton onClick={handleAdd} loading={adding}>
                Add to cart
              </PrimaryButton>
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border border-border bg-bg-base/80 p-4">
            <p className="text-sm font-semibold text-text-primary">
              Seller information
            </p>
            <p className="text-sm text-text-secondary">
              {product.seller || 'Curated Chef'} crafts heritage feasts with customized
              plating. Reach out for live counters and decor add-ons.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage