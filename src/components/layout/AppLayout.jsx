import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import { logEvent } from '../../services/logger'

const AppLayout = () => {
  const location = useLocation()

  useEffect(() => {
    logEvent('info', 'navigation', 'route-change', { path: location.pathname })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location])

  return (
    <div className="relative min-h-screen bg-bg-base text-text-primary">
      <div className="pointer-events-none absolute inset-0 bg-dark-sheen opacity-80 mix-blend-soft-light"></div>
      <div className="relative z-10">
        <Header />
        <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 md:px-6 lg:pt-10">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default AppLayout
