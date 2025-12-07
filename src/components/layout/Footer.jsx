import { Link } from 'react-router-dom'
import { LuGithub, LuLinkedin, LuMail } from 'react-icons/lu'

const Footer = () => (
  <footer className="mt-16 border-t border-border bg-[#0b111b] text-[#e8e0d2] dark:bg-[#0f1729]">
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 lg:py-16">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">
            Catering Couture
          </p>
          <p className="max-w-md text-sm text-[#c9c0b0]">
            High-touch catering marketplace connecting rural Indian chefs with
            global connoisseurs. Curated menus, luxury-grade service, and warm
            hospitality in every interaction.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-accent">
            Quick Links
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-[#d9cdb8]">
            {['Home', 'Products', 'About', 'Cart'].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
                className="rounded-lg px-2 py-1 hover:text-accent focus:ring-2 focus:ring-accent"
              >
                {item}
              </Link>
            ))}
            {typeof window !== 'undefined' && localStorage.getItem('firebase:authUser') && (
              <>
                <Link
                  to="/orders"
                  className="rounded-lg px-2 py-1 hover:text-accent focus:ring-2 focus:ring-accent"
                >
                  Orders
                </Link>
                <Link
                  to="/profile"
                  className="rounded-lg px-2 py-1 hover:text-accent focus:ring-2 focus:ring-accent"
                >
                  Profile
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-accent">
            Connect
          </h3>
          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/in/arbab-ofc/"
              target="_blank"
              rel="noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/50 text-accent transition hover:-translate-y-0.5 hover:scale-105 hover:bg-accent hover:text-[#1f130a] hover:shadow-glow"
              aria-label="LinkedIn"
            >
              <LuLinkedin size={20} />
            </a>
            <a
              href="https://github.com/Arbab-ofc"
              target="_blank"
              rel="noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/50 text-accent transition hover:-translate-y-0.5 hover:scale-105 hover:bg-accent hover:text-[#1f130a] hover:shadow-glow"
              aria-label="GitHub"
            >
              <LuGithub size={20} />
            </a>
            <a
              href="mailto:arbabprvt@gmail.com"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/50 text-accent transition hover:-translate-y-0.5 hover:scale-105 hover:bg-accent hover:text-[#1f130a] hover:shadow-glow"
              aria-label="Email"
            >
              <LuMail size={20} />
            </a>
          </div>
          <p className="text-sm text-[#c9c0b0]">
            Created & Designed by Arbab
          </p>
        </div>
      </div>
    </div>
  </footer>
)

export default Footer
