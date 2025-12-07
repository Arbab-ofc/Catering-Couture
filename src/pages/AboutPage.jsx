import { useEffect } from 'react'
import { LuSparkles, LuHeartHandshake, LuGlobe, LuFeather, LuChefHat } from 'react-icons/lu'
import PrimaryButton from '../components/common/PrimaryButton'
import LazyImage from '../components/common/LazyImage'
import { logEvent } from '../services/logger'

const pillars = [
  {
    title: 'Culinary heritage',
    icon: <LuChefHat />,
    text: 'Chef-led experiences from rural India, crafted with heirloom recipes and modern plating.',
  },
  {
    title: 'Global reach',
    icon: <LuGlobe />,
    text: 'We connect local chefs to a worldwide audience with seamless discovery and delivery.',
  },
  {
    title: 'Human warmth',
    icon: <LuHeartHandshake />,
    text: 'Concierge-level care, from curation to delivery, with transparent communication.',
  },
  {
    title: 'Intentional design',
    icon: <LuFeather />,
    text: 'A luxury-first UI with accessibility, performance, and responsive breakpoints built in.',
  },
]

const AboutPage = () => {
  useEffect(() => logEvent('info', 'about', 'viewed'), [])

  return (
    <div className="space-y-12">
      <section className="grid gap-8 rounded-3xl border border-border bg-bg-elevated/80 p-6 shadow-card md:grid-cols-[1.2fr,1fr] md:p-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-bg-base/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-text-secondary">
            <LuSparkles className="text-accent" /> About us
          </div>
          <h1 className="font-display text-4xl leading-tight text-text-primary sm:text-5xl">
            Elevating rural Indian catering to a global, luxury stage.
          </h1>
          <p className="text-lg text-text-secondary">
            Catering Couture is a full-stack marketplace connecting rural chefs with discerning
            buyers worldwide. We pair regional depth—heirloom recipes, hyperlocal sourcing—with a
            refined digital experience: signature collections, live status, rich storytelling,
            and concierge-level support.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
            <span className="rounded-full border border-border px-3 py-1">Breakpoints: 4</span>
            <span className="rounded-full border border-border px-3 py-1">Dark / Light themes</span>
            <span className="rounded-full border border-border px-3 py-1">Firebase + Cloudinary</span>
            <span className="rounded-full border border-border px-3 py-1">Full logging</span>
          </div>
          <div className="flex gap-3">
            <a href="/products" className="inline-block">
              <PrimaryButton as="span">Explore menus</PrimaryButton>
            </a>
            <a href="/" className="inline-block">
              <PrimaryButton as="span" variant="outline">
                Home
              </PrimaryButton>
            </a>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-accent/10 via-bg-base/80 to-bg-elevated/70 p-4 shadow-glow">
          <LazyImage
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80"
            alt="Indian catering"
            className="h-full w-full rounded-2xl object-cover"
            placeholderClassName="h-full w-full rounded-2xl"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-bg-elevated/80 p-6 shadow-card md:p-10">
        <h2 className="font-display text-3xl text-text-primary">Our pillars</h2>
        <p className="mt-2 max-w-2xl text-text-secondary">
          Built for luxury hospitality standards with authenticity at the core.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="group flex gap-3 rounded-2xl border border-border bg-bg-base/80 p-4 shadow-subtle transition hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                {p.icon}
              </div>
              <div>
                <p className="text-lg font-semibold text-text-primary">{p.title}</p>
                <p className="text-sm text-text-secondary">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AboutPage
