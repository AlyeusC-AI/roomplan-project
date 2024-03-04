import clsx from 'clsx'
import Link from 'next/link'

export function NavLink({ href, children, className }) {
  return (
    <Link
      href={href}
      className={clsx("inline-block rounded-lg py-1 px-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900", className)}
    >
      {children}
    </Link>
  )
}
