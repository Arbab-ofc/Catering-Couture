import { Link } from 'react-router-dom'
import { LuSearch, LuArrowLeft } from 'react-icons/lu'
import PrimaryButton from '../components/common/PrimaryButton'

const NotFoundPage = () => (
  <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-bg-elevated/80 p-8 text-center shadow-card">
    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-accent/15 text-4xl font-bold text-accent">
      404
    </div>
    <h1 className="mt-6 font-display text-3xl text-text-primary">
      We lost this page in the kitchen heat.
    </h1>
    <p className="mt-3 text-text-secondary">
      The page you are looking for is unavailable. Try searching or head back to the home
      page.
    </p>
    <div className="mx-auto mt-6 flex max-w-md items-center gap-2 rounded-2xl border border-border bg-bg-base px-3 py-2 shadow-inner">
      <LuSearch className="text-text-secondary" />
      <input
        type="search"
        placeholder="Search experiences"
        className="w-full bg-transparent text-sm text-text-primary outline-none"
      />
    </div>
    <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <Link to="/">
        <PrimaryButton variant="outline" icon={<LuArrowLeft />}>
          Go Home
        </PrimaryButton>
      </Link>
      <Link to="/products">
        <PrimaryButton>Browse Menus</PrimaryButton>
      </Link>
    </div>
  </div>
)

export default NotFoundPage
