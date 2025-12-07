import { useRouteError, Link } from 'react-router-dom'
import { LuTriangleAlert, LuArrowLeft } from 'react-icons/lu'
import PrimaryButton from '../components/common/PrimaryButton'

const ErrorPage = () => {
  const error = useRouteError()

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-bg-elevated/80 p-8 text-center shadow-card">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-danger/15 text-3xl text-danger">
        <LuTriangleAlert />
      </div>
      <h1 className="mt-4 font-display text-3xl text-text-primary">
        Something went off-menu.
      </h1>
      <p className="mt-2 text-text-secondary">
        An unexpected error occurred. Please try again or return home.
      </p>
      {error && (
        <p className="mt-2 text-sm text-text-secondary">
          {error.statusText || error.message}
        </p>
      )}
      <div className="mt-5 flex justify-center">
        <Link to="/">
          <PrimaryButton variant="outline" icon={<LuArrowLeft />}>
            Go back
          </PrimaryButton>
        </Link>
      </div>
    </div>
  )
}

export default ErrorPage
