import { ReactNode } from 'react'

export default function PostTitle({ children }: React.PropsWithChildren) {
  return (
    <div className="my-12 flex items-center justify-center">
      <h1 className="text-center text-6xl font-bold leading-tight tracking-tighter md:max-w-4xl md:text-6xl md:leading-none lg:text-6xl">
        {children}
      </h1>
    </div>
  )
}
