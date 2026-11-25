import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <p className="text-xs font-semibold tracking-[0.18em] text-brand-blue uppercase">404</p>
      <h1 className="mt-2 text-2xl font-bold text-brand-navy">This page does not exist</h1>
      <p className="mt-2 text-sm text-brand-navy-soft">
        Check the address or head back to the home screen.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
      >
        Back to home
      </Link>
    </div>
  )
}
