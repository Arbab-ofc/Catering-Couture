import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { LuMenu, LuShoppingBag, LuUser } from 'react-icons/lu'
import ThemeToggle from '../common/ThemeToggle'
import PrimaryButton from '../common/PrimaryButton'
import MobileMenu from './MobileMenu'
import { useAuth } from '../../context/AuthContext'
import { getGuestCart } from '../../services/localCart'
import { getCart } from '../../services/firebase/firestore'

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, profile, logout } = useAuth()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = useMemo(() => {
    const links = [{ label: 'Products', to: '/products' }]
    links.push({ label: 'Cart', to: '/cart' })
    if (profile?.role === 'seller') links.push({ label: 'Seller Hub', to: '/seller/products' })
    if (profile?.role === 'admin') links.push({ label: 'Dashboard', to: '/admin/dashboard' })
    return links
  }, [profile])

  useEffect(() => {
    const loadCartCount = async () => {
      if (!user?.uid) {
        const guest = getGuestCart()
        setCartCount(guest.reduce((sum, i) => sum + (i.qty || 1), 0))
      } else {
        try {
          const data = await getCart(user.uid)
          const items = data.items || []
          setCartCount(items.reduce((sum, i) => sum + (i.qty || 1), 0))
        } catch {
          setCartCount(0)
        }
      }
    }
    loadCartCount()

    const onStorage = () => {
      if (!user?.uid) {
        const guest = getGuestCart()
        setCartCount(guest.reduce((sum, i) => sum + (i.qty || 1), 0))
      }
    }
    const onCartEvent = (e) => {
      if (e.detail?.absolute !== undefined) {
        setCartCount(e.detail.absolute)
      } else if (e.detail?.delta) {
        setCartCount((prev) => Math.max(0, prev + e.detail.delta))
      }
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('cart-count-changed', onCartEvent)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('cart-count-changed', onCartEvent)
    }
  }, [user])

  return (
    <>
      <header
        className={`sticky top-0 z-30 backdrop-blur-xl transition-shadow duration-300 ${scrolled ? 'shadow-subtle' : ''}`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6 lg:py-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full border border-border/70 bg-bg-elevated/70 px-4 py-2 text-xs uppercase tracking-[0.18em] text-text-secondary backdrop-blur-md hover:border-accent"
          >
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-accent to-accent-strong shadow-glow"></span>
            Catering Couture
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-text-primary">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => {
                  const isCart = link.to === '/cart'
                  const hasCart = cartCount > 0
                  const base = `rounded-lg px-3 py-2 transition-colors duration-200 ${
                    isActive ? 'text-accent bg-accent/10' : 'hover:text-accent'
                  }`
                  return isCart && hasCart
                    ? `${base} border border-accent/40 bg-accent/5`
                    : base
                }}
              >
                <span className="flex items-center gap-2">
                  {link.label}
                  {link.to === '/cart' && cartCount > 0 && (
                    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent text-[11px] font-bold text-[#1f130a]">
                      {cartCount}
                    </span>
                  )}
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle variant="ghost" />
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="rounded-full border border-border px-3 py-2 text-sm font-semibold text-text-primary hover:border-accent"
                >
                  {profile?.name || user.displayName || user.email}
                </Link>
                <PrimaryButton variant="outline" onClick={logout}>
                  Logout
                </PrimaryButton>
              </>
            ) : (
              <>
                <Link to="/login">
                  <PrimaryButton variant="outline" icon={<LuUser size={18} />}>
                    Login
                  </PrimaryButton>
                </Link>
                <Link to="/register">
                  <PrimaryButton icon={<LuShoppingBag size={18} />}>
                    Register
                  </PrimaryButton>
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-bold text-text-primary transition hover:border-accent hover:text-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base"
            aria-label="Open navigation menu"
          >
            <LuMenu size={20} />
            Menu
          </button>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={navLinks}
        user={user}
        profile={profile}
        onLogout={logout}
      />
    </>
  )
}

export default Header
