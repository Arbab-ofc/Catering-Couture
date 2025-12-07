import { NavLink } from 'react-router-dom'
import { LuX } from 'react-icons/lu'
import ThemeToggle from '../common/ThemeToggle'
import PrimaryButton from '../common/PrimaryButton'

const linkBase =
  'block rounded-lg px-4 py-3 text-lg font-semibold tracking-wide transition-transform duration-200 ease-soft-spring hover:translate-x-1 hover:text-accent'

const MobileMenu = ({ open, onClose, links, user, profile, onLogout }) => (
  <div
    className={`fixed inset-0 z-40 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
  >
    <div
      className={`absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    />
    <div
      className={`absolute right-0 top-0 h-full w-[80%] max-w-sm bg-bg-elevated/95 px-6 py-8 shadow-card transition-transform duration-300 ease-soft-spring backdrop-blur-xl ${open ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm font-bold uppercase tracking-[0.15em] text-text-primary">
          Menu
        </div>
        <button
          onClick={onClose}
          className="rounded-full border border-border p-2 hover:border-accent hover:text-accent focus:ring-2 focus:ring-accent"
          aria-label="Close menu"
        >
          <LuX size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {links.map((link, index) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) =>
              `${linkBase} ${
                isActive ? 'text-accent' : 'text-text-primary'
              } transition-delay-[${index * 50}ms]`
            }
          >
            {link.label}
          </NavLink>
        ))}
        {user && (
          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'text-accent' : 'text-text-primary'}`
            }
          >
            {profile?.name || user.displayName || 'Profile'}
          </NavLink>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <ThemeToggle />
        {user ? (
          <div className="space-y-3">
            <NavLink to="/profile" onClick={onClose}>
              <div className="rounded-2xl border border-border px-3 py-2 text-sm text-text-primary">
                {profile?.name || user.displayName || user.email}
              </div>
            </NavLink>
            <PrimaryButton className="w-full" variant="outline" onClick={onLogout}>
              Logout
            </PrimaryButton>
          </div>
        ) : (
          <div className="flex gap-3">
            <NavLink className="flex-1" to="/login" onClick={onClose}>
              <PrimaryButton variant="outline" className="w-full">
                Login
              </PrimaryButton>
            </NavLink>
            <NavLink className="flex-1" to="/register" onClick={onClose}>
              <PrimaryButton className="w-full">Register</PrimaryButton>
            </NavLink>
          </div>
        )}
      </div>
    </div>
  </div>
)

export default MobileMenu
