import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { init } from '@amplitude/analytics-browser'
import StateChangeProvider from '@components/layouts/StateChangeProvider'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { Analytics } from '@vercel/analytics/react'
import Script from 'next/script'
import { GoogleAnalytics } from 'nextjs-google-analytics'

import 'focus-visible'

import ErrorBoundary from '../components/ErrorBoundary'
import { trpc } from '../utils/trpc'

import 'nprogress/nprogress.css'
import '@styles/tailwind.css'
import '@fullcalendar/common/main.css' // @fullcalendar/react imports @fullcalendar/common
import '@fullcalendar/daygrid/main.css' // @fullcalendar/timegrid imports @fullcalendar/daygrid
import '@fullcalendar/timegrid/main.css' // @fullcalendar/timegrid is a direct import
import '../lib/shared-pdf-styles.css'
import '../lib/unshared-pdf-styles.css'

const App = ({ Component, pageProps }) => {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())

  useEffect(() => {
    init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY)
  }, [])

  return (
    <ErrorBoundary>
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <StateChangeProvider>
          <GoogleAnalytics trackPageViews />
          <Analytics />
          <Component {...pageProps} />
          <Toaster position="bottom-center" />
          {/* {process.env.NODE_ENV !== 'production' && (
            <div className="fixed left-4 bottom-4  text-orange-500  text-xs font-bold">
              Dev
            </div>
          )} */}
          <Script
            strategy="lazyOnload"
            src="https://www.googletagmanager.com/gtag/js?id=AW-11015712809"
          />
          <Script strategy="lazyOnload" id="11015712809">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-11015712809');
            `}
          </Script>
          <Script strategy="lazyOnload" id="segment">
            {`
                !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey="c1CzZANeejURxmCcfB9648snmhmyS9KE";;analytics.SNIPPET_VERSION="4.15.3";
                analytics.load("c1CzZANeejURxmCcfB9648snmhmyS9KE");
                analytics.page();
                }}();
            `}
          </Script>
          <Script
            type="text/javascript"
            id="hs-script-loader"
            strategy="lazyOnload"
            src="//js-na1.hs-scripts.com/23251343.js"
          />
        </StateChangeProvider>
      </SessionContextProvider>
    </ErrorBoundary>
  )
}

export default trpc.withTRPC(App)
