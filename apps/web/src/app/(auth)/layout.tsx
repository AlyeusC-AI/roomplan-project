import { Card, CardContent } from '@components/ui/card'

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <div className="min-h-svh flex h-screen flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden">
            <CardContent className="grid p-0 md:grid-cols-2 min-h-[60vh]">
              {children}
              <div className="relative hidden bg-muted md:block h-full">
                <img
                  src="/caterpiller.jpg"
                  alt="Image"
                  className="absolute inset-0 w-full h-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            By clicking continue, you agree to our{' '}
            <a href="/terms">Terms of Service</a> and{' '}
            <a href="/privacy">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  )
}
