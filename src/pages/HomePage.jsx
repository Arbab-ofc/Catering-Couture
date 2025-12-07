import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LuArrowRight, LuSparkles } from 'react-icons/lu'
import PrimaryButton from '../components/common/PrimaryButton'
import LazyImage from '../components/common/LazyImage'
import ProductCard from '../components/products/ProductCard'
import { logEvent, logError } from '../services/logger'
import { useAuth } from '../context/AuthContext'
import { listProducts } from '../services/firebase/firestore'
import { addToCart } from '../services/firebase/firestore'
import { addGuestItem } from '../services/localCart'

const featuredProducts = [
  {
    name: 'Royal Nawabi Spread',
    price: '2,499',
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80',
    seller: 'Chef Aarav (Lucknow)',
    location: 'Lucknow, India',
    category: 'Hyderabadi',
  },
  {
    name: 'Coastal Spice Banquet',
    price: '1,899',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1600&q=80',
    seller: 'Chef Meera (Goa)',
    location: 'Goa, India',
    category: 'Konkan',
  },
  {
    name: 'Heritage Thali Experience',
    price: '1,499',
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80',
    seller: 'Chef Dev (Jaipur)',
    location: 'Jaipur, India',
    category: 'Rajasthani',
  },
]

const categories = [
  { label: 'Royal Weddings', accent: 'Heritage feasts with regal plating' },
  { label: 'Destination Retreats', accent: 'Curated menus for off-site escapes' },
  { label: 'Festive Celebrations', accent: 'Seasonal specials & mithai bars' },
  { label: 'Corporate Lux', accent: 'Executive fine-dine experiences' },
]

const steps = [
  {
    title: 'Discover',
    detail: 'Browse regional chefs with immersive menus and rich storytelling.',
  },
  {
    title: 'Curate',
    detail: 'Choose dishes, set preferences, and chat with sellers in-app.',
  },
  {
    title: 'Delight',
    detail: 'White-glove delivery, impeccable plating, and live status tracking.',
  },
]

const testimonials = [
  {
    quote:
      'We booked a Nawabi spread for a private soirée—spectacular flavours and flawless service.',
    name: 'Amara Kapoor',
    role: 'Wedding Planner, Mumbai',
  },
  {
    quote:
      'The seller dashboard is intuitive. Uploading seasonal menus and managing orders is seamless.',
    name: 'Chef Kavya',
    role: 'Coastal Caterer, Kerala',
  },
]

const HomePage = () => {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [featured, setFeatured] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(false)
  const [slide, setSlide] = useState(0)
  const touchStartX = useRef(null)
  const carouselRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const AUTO_INTERVAL = 3500

  useEffect(() => {
    logEvent('info', 'home', 'viewed')
    const loadTopRated = async () => {
      setLoadingFeatured(true)
      try {
        const remote = await listProducts()
        const sorted = remote
          .filter((p) => Number(p.rating) > 0)
          .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
          .slice(0, 3)
        if (sorted.length) {
          setFeatured(sorted)
        }
      } catch (err) {
        logError('home', 'featured-load-failed', err)
      } finally {
        setLoadingFeatured(false)
      }
    }
    loadTopRated()
  }, [])

  const slides = useMemo(() => featured, [featured])

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
      logEvent('info', 'cart', 'add-home', { productId: payload.productId })
      window.dispatchEvent(new CustomEvent('cart-count-changed', { detail: { delta: 1 } }))
    } catch (err) {
      logError('cart', 'add-home-failed', err, { productId: payload.productId })
    }
  }

  const nextSlide = () => setSlide((prev) => (prev + 1) % (slides.length || 1))
  const prevSlide = () =>
    setSlide((prev) => (prev - 1 + (slides.length || 1)) % (slides.length || 1))

  useEffect(() => {
    if (!slides.length || paused) return
    const id = setInterval(() => {
      setSlide((prev) => (prev + 1) % slides.length)
    }, AUTO_INTERVAL)
    return () => clearInterval(id)
  }, [slides, paused])

  const handleBecomeSeller = () => {
    if (!user) {
      navigate('/register')
      return
    }
    if (profile?.role === 'seller') {
      navigate('/seller/orders')
      return
    }
    if (profile?.role === 'admin') {
      navigate('/admin/dashboard')
      return
    }
    navigate('/profile')
  }

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-bg-elevated/70 px-4 py-12 shadow-card backdrop-blur-xl md:px-10 lg:px-14 lg:py-16">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-accent-strong/10"></div>
        <div className="relative z-10 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-base/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-text-secondary">
              <LuSparkles className="text-accent" />
              Rural India. Global Plate.
            </div>
            <h1 className="font-display text-4xl leading-tight text-text-primary sm:text-5xl">
              Luxury catering that celebrates India&apos;s richest culinary
              heritage.
            </h1>
            <p className="text-lg text-text-secondary">
              Discover chef-led kitchens from rural India, craft exquisite menus
              for every celebration, and enjoy concierge-level service with live
              tracking, curated plating, and themed decor options.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/products">
                <PrimaryButton icon={<LuArrowRight />}>View Menus</PrimaryButton>
              </Link>
              <PrimaryButton variant="outline" onClick={handleBecomeSeller}>
                Become a Seller
              </PrimaryButton>
            </div>
            <div className="flex gap-6 text-sm text-text-secondary">
              <div>
                <p className="text-2xl font-semibold text-text-primary">150+</p>
                <p>Regional chefs</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-text-primary">4.9</p>
                <p>Average rating</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-text-primary">18</p>
                <p>States represented</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {featuredProducts.slice(0, 2).map((item, idx) => (
              <div
                key={item.name}
                className={`relative overflow-hidden rounded-2xl border border-border/60 shadow-card ${idx === 1 ? 'mt-8' : ''}`}
              >
                <LazyImage
                  src={item.image}
                  alt={item.name}
                  className="h-64 w-full object-cover"
                  placeholderClassName="h-64 w-full"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.14em]">
                    {item.category}
                  </p>
                  <p className="text-lg font-semibold">{item.name}</p>
                  <p className="text-sm opacity-80">By {item.seller}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
              Featured
            </p>
            <h2 className="font-display text-3xl text-text-primary">
              Signature experiences
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Hand-picked, top-rated menus from verified sellers—rotating daily with your highest-rated favourites.
            </p>
          </div>
          <Link to="/products" className="hidden sm:inline-block">
            <PrimaryButton variant="ghost" icon={<LuArrowRight />}>
              Explore all
            </PrimaryButton>
          </Link>
        </div>
        <div
          className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-bg-base/80 via-bg-elevated/70 to-bg-base/70 p-3 shadow-card"
          ref={carouselRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX
          }}
          onTouchMove={(e) => {
            if (touchStartX.current === null) return
            const delta = e.touches[0].clientX - touchStartX.current
            if (Math.abs(delta) > 50) {
              delta > 0 ? prevSlide() : nextSlide()
              touchStartX.current = null
            }
          }}
          onTouchEnd={() => {
            touchStartX.current = null
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,215,128,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_35%)]" />
          <div className="pointer-events-none absolute -left-12 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-accent-strong/10 blur-3xl" />
          <div className="pointer-events-none absolute left-4 top-4 z-20 hidden flex-col gap-2 lg:flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-semibold text-text-primary shadow-subtle">
              ★ Top rated pick
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-bg-base/70 px-3 py-1 text-[11px] font-semibold text-text-primary shadow-subtle">
              Verified seller
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-bg-base/80 px-3 py-1 text-[11px] font-semibold text-text-secondary shadow-subtle">
              Curated daily • Live ratings • Fresh arrivals
            </span>
          </div>
          {loadingFeatured && (
            <div className="flex items-center justify-center gap-3 py-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="hidden w-full max-w-[360px] animate-pulse overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-bg-base/70 via-bg-elevated/70 to-bg-base/60 shadow-subtle sm:block"
                >
                  <div className="aspect-[3/2] w-full bg-gradient-to-r from-bg-base via-bg-elevated to-bg-base/80" />
                  <div className="space-y-3 px-4 py-4">
                    <div className="h-3 w-24 rounded-full bg-border" />
                    <div className="h-5 w-48 rounded bg-border/80" />
                    <div className="h-3 w-32 rounded bg-border/70" />
                    <div className="h-10 w-full rounded-xl bg-border/70" />
                  </div>
                </div>
              ))}
              {}
              <div className="w-full max-w-[360px] animate-pulse overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-bg-base/70 via-bg-elevated/70 to-bg-base/60 shadow-subtle sm:hidden">
                <div className="aspect-[3/2] w-full bg-gradient-to-r from-bg-base via-bg-elevated to-bg-base/80" />
                <div className="space-y-3 px-4 py-4">
                  <div className="h-3 w-24 rounded-full bg-border" />
                  <div className="h-5 w-48 rounded bg-border/80" />
                  <div className="h-3 w-32 rounded bg-border/70" />
                  <div className="h-10 w-full rounded-xl bg-border/70" />
                </div>
              </div>
            </div>
          )}
          {!loadingFeatured && !slides.length && (
            <p className="text-sm text-text-secondary px-2">
              No rated products yet. Explore all to discover menus.
            </p>
          )}

          {slides.length > 0 && (
            <>
              <div className="relative">
                <span className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center text-[18vw] font-black italic uppercase tracking-[0.18em] text-text-secondary/10 opacity-30 md:text-[14vw] lg:text-[140px]">
                  Couture
                </span>
                <div
                  className="relative z-10 flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${slide * 100}%)` }}
                >
                  {slides.map((product) => (
                    <div key={product.id || product.name} className="min-w-full px-2">
                      <div className="relative mx-auto w-full max-w-[360px]">
                        <div className="relative z-10">
                          <ProductCard product={product} onQuickAdd={handleQuickAdd} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between px-2">
                <button
                  onClick={prevSlide}
                  className="rounded-full border border-border/80 bg-bg-base/70 px-3 py-2 text-sm font-semibold text-text-primary shadow-subtle transition hover:border-accent hover:text-accent"
                  aria-label="Previous"
                >
                  Prev
                </button>
                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-bg-base/70 px-3 py-1.5 shadow-inner">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSlide(idx)}
                      className={`h-2.5 w-2.5 rounded-full transition ${
                        slide === idx ? 'bg-accent shadow-glow' : 'bg-border'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    ></button>
                  ))}
                </div>
                <button
                  onClick={nextSlide}
                  className="rounded-full border border-border/80 bg-bg-base/70 px-3 py-2 text-sm font-semibold text-text-primary shadow-subtle transition hover:border-accent hover:text-accent"
                  aria-label="Next"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-bg-elevated/80 p-6 shadow-subtle md:p-10">
        <h2 className="font-display text-3xl text-text-primary">
          Curated categories
        </h2>
        <p className="mt-2 max-w-2xl text-text-secondary">
          Hand-picked collections for every celebration. Mix and match dishes,
          add live counters, or request custom plating.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className="group relative overflow-hidden rounded-2xl border border-border bg-bg-base px-4 py-6 shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 transition group-hover:opacity-100"></div>
              <p className="text-xs uppercase tracking-[0.16em] text-accent">
                Category
              </p>
              <h3 className="mt-2 font-display text-xl text-text-primary">
                {cat.label}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">{cat.accent}</p>
              <Link
                to="/products"
                className="mt-4 inline-flex items-center text-sm font-semibold text-accent"
              >
                View menus
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-border bg-bg-elevated/80 p-6 shadow-subtle md:grid-cols-2 md:p-10">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
            Flow
          </p>
          <h2 className="font-display text-3xl text-text-primary">
            How it works
          </h2>
          <p className="mt-2 max-w-xl text-text-secondary">
            Designed for seamless collaboration between buyers and rural chefs.
            Real-time updates, smart notifications, and documented preferences.
          </p>
        </div>
        <div className="grid gap-4">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className="flex gap-4 rounded-2xl border border-border bg-bg-base/90 p-4 shadow-subtle"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 font-semibold text-text-primary">
                {idx + 1}
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">
                  {step.title}
                </h3>
                <p className="text-sm text-text-secondary">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-bg-elevated/70 p-6 shadow-subtle md:p-10">
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="rounded-2xl border border-border bg-bg-base/90 p-6 shadow-card"
            >
              <p className="text-lg text-text-primary">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-4 text-sm text-text-secondary">
                <p className="font-semibold text-text-primary">{item.name}</p>
                <p>{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-border bg-golden-gradient px-6 py-10 shadow-card md:px-12 md:py-12">
        <div className="grid gap-6 md:grid-cols-[2fr,1fr] md:items-center">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-[#442d12]">
              Join the marketplace
            </p>
            <h3 className="font-display text-3xl text-[#2c1b0a]">
              Ready to host your next indulgent gathering?
            </h3>
            <p className="max-w-2xl text-[#4a2f12]">
              Admins discover premium chefs with transparent pricing. Sellers get
              a dashboard tailored for menu uploads, order tracking, and real-time
              messaging with buyers.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <PrimaryButton variant="outline" onClick={handleBecomeSeller}>
                Become a Seller
              </PrimaryButton>
              <Link to="/products">
                <PrimaryButton variant="ghost">Browse Menus</PrimaryButton>
              </Link>
            </div>
          </div>
          <div className="hidden justify-end md:flex">
            <div className="glass rounded-2xl px-6 py-8 text-right shadow-glow">
              <p className="text-sm uppercase tracking-[0.2em] text-[#f6e7c9]">
                Service Promise
              </p>
              <p className="mt-2 text-lg text-white">
                24/7 concierge, curated plating, and proactive updates from prep
                to delivery.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage